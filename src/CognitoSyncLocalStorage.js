/**
 * Copyright 2014 Amazon.com,
 * Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Amazon Software License (the "License").
 * You may not use this file except in compliance with the
 * License. A copy of the License is located at
 *
 *     http://aws.amazon.com/asl/
 *
 * or in the "license" file accompanying this file. This file is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, express or implied. See the License
 * for the specific language governing permissions and
 * limitations under the License.
 */

AWS = AWS || {};
AWS.CognitoSyncManager = AWS.CognitoSyncManager || {};

AWS.CognitoSyncManager.LocalStorage = (function() {

    /**
     *
     * @param options
     * @constructor
     */

    var CognitoSyncLocalStorage = function (options) {

        options = options || {};

        this.store = null;
        this.meta = null;

        // Choose a data store
        if (options.DataStore) { this.store = new options.DataStore(); }
        else { this.store = new AWS.CognitoSyncManager.StoreInMemory(); }

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @returns {string}
     */

    CognitoSyncLocalStorage.prototype.getMetadataKey = function (identityId, datasetName) {
        return identityId + '.' + datasetName;
    };

    /**
     *
     * @param identityId
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.loadMetadataCache = function (identityId, callback) {

        var root = this;

        this.store.get('_internal', '_metadata', identityId, function (err, data) {

            if (err) {
                return callback(err, null);
            }
            if (!data) {
                data = {};
            }

            root.meta = data;
            callback(null, data);

        });

    };

    /**
     *
     * @param identityId
     * @param metadata
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.saveMetadataCache = function (identityId, metadata, callback) {
        this.store.set('_internal', '_metadata', identityId, metadata, function (err) {
            if (err) {
                return callback(err);
            }
            return callback(null, metadata);
        });
    };

    /**
     *
     * @param id
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.saveCachedId = function (id, callback) {
        this.store.set('_internal', '_cached', 'id', id, function (err) {
            if (err) {
                return callback(err);
            }
            return callback(null, id);
        });
    };

    /**
     *
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.loadCachedId = function (callback) {
        this.store.get('_internal', '_cached', 'id', function (err, id) {
            if (err) {
                return callback(err, null);
            }
            callback(null, id);
        });
    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param callback
     * @returns {CognitoSyncLocalStorage}
     */

    CognitoSyncLocalStorage.prototype.createDataset = function (identityId, datasetName, callback) {

        var root = this;

        this.getDatasetMetadata(identityId, datasetName, function (err, metadata) {

            var stamp = new Date().getTime();

            if (!metadata) {

                metadata = new AWS.CognitoSyncManager.DatasetMetadata({
                    DatasetName: datasetName,
                    CreationDate: stamp,
                    LastModifiedDate: stamp
                });

                root.setDatasetMetadata(identityId, datasetName, metadata, function (err, data) {
                    // No-op. Silent update.
                });

                callback(null, datasetName);

            } else {
                callback(null, datasetName);
            }

        });

        return this;

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param callback
     * @returns {CognitoSyncLocalStorage}
     */

    CognitoSyncLocalStorage.prototype.getDatasetMetadata = function (identityId, datasetName, callback) {

        var key = this.getMetadataKey(identityId, datasetName);

        if (this.meta !== null) {

            // Meta data is already loaded. Look it up and return.
            if (this.meta[key]) {
                callback(null, new AWS.CognitoSyncManager.DatasetMetadata(this.meta[key]));
            }
            else {
                callback(null, undefined);
            }

        } else {

            // Load metadata from cache.
            this.loadMetadataCache(identityId, function (err, cache) {
                if (cache[key]) {
                    callback(null, new AWS.CognitoSyncManager.DatasetMetadata(cache[key]));
                }
                else {
                    callback(null, undefined);
                }
            });

        }

        return this;

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param metadata
     * @param callback
     * @returns {CognitoSyncLocalStorage}
     */

    CognitoSyncLocalStorage.prototype.setDatasetMetadata = function (identityId, datasetName, metadata, callback) {

        // Write metadata.
        this.meta[this.getMetadataKey(identityId, datasetName)] = metadata.toJSON();

        // Save metadata.
        this.saveMetadataCache(identityId, this.meta, callback);

        return this;

    };


    /**
     *
     * @param identityId
     * @param datasetName
     * @param key
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.getValue = function (identityId, datasetName, key, callback) {

        this.getRecord(identityId, datasetName, key, function (err, record) {

            if (!record) {
                return callback(null, undefined);
            }

            return callback(null, record.getValue());

        });

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param key
     * @param value
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.putValue = function (identityId, datasetName, key, value, callback) {

        var root = this;

        this.getRecord(identityId, datasetName, key, function (err, record) {


            if (record && record.getValue() == value) {
                // Record hasn't changed. All done.
                return callback(null, record);
            }

            // If record doesn't exist, create a new instance.
            if (!record) {
                record = new AWS.CognitoSyncManager.Record();
            }

            // Update the record with the new properties.
            record.setKey(key)
                .setValue(value)
                .setModified(true)
                .setSyncCount(record ? record.getSyncCount() : 0)
                .setDeviceLastModifiedDate(new Date());

            root.store.set(identityId, datasetName, key, record.toJSON(), function (err) {

                if (err) {
                    return callback(err);
                }

                root.updateLastModifiedTimestamp(identityId, datasetName, function (err) {
                    return callback(err, record);
                });

            });

        });

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.getValueMap = function (identityId, datasetName, callback) {

        var values = {};
        var record;

        this.getRecords(identityId, datasetName, function (err, records) {

            for (var r in records) {
                if (records.hasOwnProperty(r)) {
                    record = records[r];
                    if (!record.isDeleted()) {
                        values[record.getKey()] = record.getValue();
                    }
                }
            }

            callback(null, values);

        });

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param values
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.putAllValues = function (identityId, datasetName, values, callback) {

        var root = this;

        var remain = [];

        // Build a list of each value to put.

        for (var v in values) {
            if (values.hasOwnProperty(v)) {
                remain.push(v);
            }
        }

        var request = function (err) {

            var item;

            if (err) {
                return callback(err);
            }

            if (remain.length > 0) {

                // Put each item in the request.
                item = remain.shift();
                root.putValue(identityId, datasetName, item, values[item], request);

            } else {

                // Nothing else to update. Break the loop.
                callback(null, true);

            }

        };

        request(null, null);

    };

    /**
     *
     * @param identityId
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.getDatasets = function (identityId, callback) {

        var datasets = [];

        if (this.meta !== null) {

            for (var m in this.meta) {
                if (this.meta.hasOwnProperty(m)) {
                    datasets.push(new AWS.CognitoSyncManager.DatasetMetadata(this.meta[m]));
                }
            }

            return callback(null, datasets);

        } else {

            // Meta data is not loaded. Load it.
            this.loadMetadataCache(identityId, function (err, metadata) {

                for (var m in metadata) {
                    if (metadata.hasOwnProperty(m)) {
                        datasets.push(new AWS.CognitoSyncManager.DatasetMetadata(metadata[m]));
                    }
                }

                return callback(null, datasets);

            });

        }

    };

    /**
     *
     * @param identityId
     * @param metadata
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.updateDatasetMetadata = function (identityId, metadata, callback) {

        var root = this;

        this.getDatasetMetadata(identityId, metadata.getDatasetName(), function (err, local) {

            if (err) {
                callback(err);
            }

            if (!local) {
                local = new AWS.CognitoSyncManager.DatasetMetadata();
            }

            local.setDatasetName(metadata.getDatasetName())
                .setCreationDate(metadata.getCreationDate())
                .setLastModifiedDate(metadata.getLastModifiedDate())
                .setLastModifiedBy(metadata.getLastModifiedBy())
                .setLastSyncCount(metadata.getLastSyncCount())
                .setRecordCount(metadata.getRecordCount())
                .setDataStorage(metadata.getDataStorage());

            // Save the updated metadata to the in-memory store.

            root.meta[root.getMetadataKey(identityId, metadata.getDatasetName())] = local.toJSON();

            // Save the updated metadata to the on-disk store.

            root.saveMetadataCache(identityId, root.meta, function (err) {
                if (err) {
                    callback(err);
                }
                callback(null, local);
            });

        });

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param key
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.getRecord = function (identityId, datasetName, key, callback) {

        this.store.get(identityId, datasetName, key, function (err, record) {

            if (record) {
                return callback(null, new AWS.CognitoSyncManager.Record(record));
            }

            return callback(new Error('Key doesn\'t exist.'), null);

        });

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.getRecords = function (identityId, datasetName, callback) {

        var records = [];

        this.store.getAll(identityId, datasetName, function (err, local) {

            for (var l in local) {
                if (local.hasOwnProperty(l)) {
                    records.push(new AWS.CognitoSyncManager.Record(local[l]));
                }
            }

            callback(null, records);

        });

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param records
     * @param callback
     * @returns {CognitoSyncLocalStorage}
     */

    CognitoSyncLocalStorage.prototype.putRecords = function (identityId, datasetName, records, callback) {

        var root = this;

        records = records || [];

        var request = function () {

            if (records.length > 0) {

                root.updateAndClearRecord(identityId, datasetName, records.shift(), function (err) {

                    if (err) { return callback(err); }
                    if (records.length === 0) { return callback(null, true); }

                    request();

                });

            }

        };

        request();

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.deleteDataset = function (identityId, datasetName, callback) {

        var root = this;

        // Delete the records.

        this.store.removeAll(identityId, datasetName, function (err) {

            if (err) { return callback(err); }

            // Update dataset metadata.

            root.getDatasetMetadata(identityId, datasetName, function (err, metadata) {

                if (err) { return callback(err); }

                metadata.setLastModifiedDate(new Date());
                metadata.setSyncCount(-1);

                root.updateDatasetMetadata(identityId, metadata, function (err) {
                    if (err) { return callback(err); }
                    return callback(null, true);
                });

            });

        });

    };

    /**
     * Removes dataset from local storage. Does not remove dataset from remote storage.
     * @param identityId
     * @param datasetName
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.purgeDataset = function (identityId, datasetName, callback) {

        // Delete records.
        this.deleteDataset(identityId, datasetName, function (err) {

            if (err) { callback(err); }

            // Delete metadata.
            delete(this.meta[datasetName]);

            // Save metadata.
            this.saveMetadataCache(identityId, datasetName, this.meta, function (err, result) {
                callback(null, result);
            });

        });

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.getLastSyncCount = function (identityId, datasetName, callback) {

        this.getDatasetMetadata(identityId, datasetName, function (err, metadata) {

            if (metadata) { return callback(null, metadata.getLastSyncCount()); }

            callback(new Error('Dataset doesn\'t exist.'), null);

        });

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.getModifiedRecords = function (identityId, datasetName, callback) {

        var modified = [];

        this.getRecords(identityId, datasetName, function (err, records) {

            for (var i = 0; i < records.length; i++) {

                if (records[i].isModified()) {
                    modified.push(records[i]);
                }

            }

            callback(null, modified);

        });

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param lastSyncCount
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.updateLastSyncCount = function (identityId, datasetName, lastSyncCount, callback) {

        var root = this;

        this.getDatasetMetadata(identityId, datasetName, function (err, meta) {

            if (err) {
                callback(err);
            }

            meta.setLastSyncCount(lastSyncCount).setLastSyncDate(new Date());

            root.updateDatasetMetadata(identityId, meta, function (err) {
                if (err) {
                    callback(err);
                }
                callback(null, true);
            });

        });

    };

    /**
     *
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.wipeData = function (callback) {
        this.store.wipe(callback);
    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.updateLastModifiedTimestamp = function (identityId, datasetName, callback) {

        var root = this;

        this.getDatasetMetadata(identityId, datasetName, function (err, meta) {

            if (err) {
                return callback(err);
            }

            meta.setLastModifiedDate(new Date());

            root.updateDatasetMetadata(identityId, meta, function (err) {
                if (err) {
                    return callback(err);
                }
                return callback(null, true);
            });

        });

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param record
     */

    CognitoSyncLocalStorage.prototype.removeRecord = function (identityId, datasetName, record) {

        this.store.remove(identityId, datasetName, record, function (err) {
            if (err) {
                return callback(err);
            }
            return callback(null, true);
        });

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param record
     * @param callback
     */

    CognitoSyncLocalStorage.prototype.updateAndClearRecord = function (identityId, datasetName, record, callback) {

        // Save record to local store.

        this.store.set(identityId, datasetName, record.getKey(), record.toJSON(), function (err) {
            if (err) {
                return callback(err);
            }
            return callback(null, true);
        });

    };

    return CognitoSyncLocalStorage;

})();