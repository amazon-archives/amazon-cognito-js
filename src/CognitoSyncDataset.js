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

AWS.CognitoSyncManager.Dataset = (function() {

    /**
     * Constructs a new dataset class.
     * @param {string} datasetName
     * @param provider
     * @param {AWS.CognitoSyncLocalStorage} local
     * @param {AWS.CognitoSyncRemoteStorage} remote
     * @param {function} logger
     * @constructor
     */

    var CognitoSyncDataset = function(datasetName, provider, local, remote, logger) {

        this.MAX_RETRY = 3;

        this.datasetName = datasetName;
        this.provider = provider;
        this.local = local;
        this.remote = remote;
        this.logger = logger || function(){};

    };

    /**
     * Validates the record key to ensure it is not empty and shorter than 128 characters.
     * @param {String} key The key to validate.
     * @returns {boolean}
     */

    CognitoSyncDataset.prototype.validateKey = function(key) {
        var namePattern = new RegExp('^[a-zA-Z0-9_.:-]{1,128}$');
        return namePattern.test(key);
    };

    /**
     * Writes a record to local storage.
     * @param {string} key
     * @param {string} value
     * @param {function} callback Callback(Error, Record)
     */

    CognitoSyncDataset.prototype.put = function(key, value, callback) {
        var valueType = typeof value;
        if (!this.validateKey(key)) { return callback(new Error('Invalid key.')); }
        if (valueType !== 'string') {
            return callback(new Error('The value type must be a string but was ' + valueType + '.'));
        }
        this.local.putValue(this.getIdentityId(), this.datasetName, key, value, callback);
    };

    /**
     * Writes a record as null, to be cleaned up on the next synchronization.
     * @param {string} key The key to remove.
     * @param {function} callback Callback(Error, Record)
     */

    CognitoSyncDataset.prototype.remove = function(key, callback) {
        if (!this.validateKey(key)) { return callback(new Error('Invalid key.')); }
        this.local.putValue(this.getIdentityId(), this.datasetName, key, null, callback);
    };

    /**
     * Gets a record's value from local storage.
     * @param {string} key
     * @param {function} callback Callback(Error, Value)
     */

    CognitoSyncDataset.prototype.get = function(key, callback) {
        if (!this.validateKey(key)) { return callback(new Error('Invalid key.')); }
        this.local.getValue(this.getIdentityId(), this.datasetName, key, callback);
    };

    /**
     * Gets all records in a dataset from local storage.
     * @param {function} callback Callback(Error, Records)
     */

    CognitoSyncDataset.prototype.getAllRecords = function(callback) {
        this.local.getRecords(this.getIdentityId(), this.datasetName, callback);
    };

    /**
     * Returns the amount of data stored on the server.
     * @param callback
     */

    CognitoSyncDataset.prototype.getDataStorage = function(callback) {

        this.getDatasetMetadata(function(err, meta) {
            if (err) { return callback(err); }
            if (!meta) { return callback(null, 0); }
            return callback(null, meta.getDataStorage());
        });

    };

    /**
     * Returns if a specific record has changed.
     * @param key
     * @param callback
     */

    CognitoSyncDataset.prototype.isChanged = function(key, callback) {
        if (!this.validateKey(key)) { return callback(new Error('Invalid key.')); }
        this.local.getRecord(this.getIdentityId(), this.datasetName, key, function(err, record) {
            callback(null, (record && record.isModified()));
        });
    };

    /**
     * Returns the dataset metadata.
     * @param callback
     */

    CognitoSyncDataset.prototype.getDatasetMetadata = function(callback) {
        this.local.getDatasetMetadata(this.getIdentityId(), this.datasetName, callback);
    };

    /**
     * Resolves conflicts using the records provided.
     * @param resolvedRecords
     * @param callback
     */

    CognitoSyncDataset.prototype.resolve = function(resolvedRecords, callback) {
        this.local.putRecords(this.getIdentityId(), this.datasetName, resolvedRecords, callback);
    };

    /**
     * Puts all values into the dataset.
     * @param values
     * @param callback
     * @returns {*}
     */

    CognitoSyncDataset.prototype.putAll = function(values, callback) {

        var isValid = true;

        for (var key in values) {
            if (values.hasOwnProperty(key)) {
                if (!this.validateKey(key)) { isValid = false; }
            }
        }

        if (!isValid) { return callback(new Error('Object contains invalid keys.')); }

        this.local.putAllValues(this.getIdentityId(), this.datasetName, values, callback);

    };

    /**
     * Returns all records from a dataset.
     * @param callback
     */

    CognitoSyncDataset.prototype.getAll = function(callback) {

        var map = {};
        var record;

        this.local.getRecords(this.getIdentityId(), this.datasetName, function(err, records) {

            if (err) { return callback(err); }

            for (var r in records) {
                if (records.hasOwnProperty(r)) {
                    record = records[r];
                    if (!record.isDeleted()) { map[record.getKey()] = record.getValue(); }
                }
            }

            callback(null, map);

        });

    };

    /**
     * Returns the current user's identity id.
     * @returns {string};
     */

    CognitoSyncDataset.prototype.getIdentityId = function() {
        return this.provider.identityId;
    };

    /**
     * Returns the records that have been modified.
     * @param callback
     */

    CognitoSyncDataset.prototype.getModifiedRecords = function(callback) {
        this.local.getModifiedRecords(this.getIdentityId(), this.datasetName, callback);
    };

    /**
     * Returns a list of datasets that have been merged.
     * @param callback
     */

    CognitoSyncDataset.prototype.getLocalMergedDatasets = function(callback) {

        var mergedDatasets = [];
        var prefix = this.datasetName + '.';
        var dataset;

        this.local.getDatasets(this.getIdentityId(), function(err, datasets) {

            for (var d in datasets) {
                if (datasets.hasOwnProperty(d)) {

                    dataset = datasets[d];

                    if (dataset.getDatasetName().indexOf(prefix) === 0) {
                        mergedDatasets.push(dataset.getDatasetName());
                    }

                }
            }

            callback(null, mergedDatasets);

        });

    };

    /**
     * Starts the synchronization process.
     * @param callback
     * @param retry
     */

    CognitoSyncDataset.prototype.synchronize = function(callback, retry) {

        var root = this;

        // Validate callback object.
        callback = callback || {};
        callback.onSuccess = callback.onSuccess || function(dataset, updates) {};
        callback.onFailure = callback.onFailure || function(err) {};
        callback.onConflict = callback.onConflict || function(dataset, conflicts, callback) { return callback(false); };
        callback.onDatasetDeleted = callback.onDatasetDeleted || function(dataset, deletedDataset, callback) { return callback(false); };
        callback.onDatasetsMerged = callback.onDatasetsMerged || function(dataset, merges, callback) { return callback(false); };

        // Validate/initialize retry count.
        if (retry === undefined) { retry = this.MAX_RETRY; }

        root.logger('Starting synchronization... (retries: ' + retry + ')');

        if (retry < 0) {
            return callback.onFailure(new Error('Synchronize failed: exceeded maximum retry count.'));
        }

        // First check if any datasets have been merged locally.

        this.getLocalMergedDatasets(function(err, mergedDatasets) {

            if (err) { callback.onFailure(err); }

            root.logger('Checking for locally merged datasets... found ' + mergedDatasets.length + '.');

            // Detect if merged datasets.
            if (mergedDatasets.length > 0) {

                root.logger('Deferring to .onDatasetsMerged.');

                return callback.onDatasetsMerged(root, mergedDatasets, function(isContinue) {

                    if (!isContinue) {

                        // Merges were not handled by callback. Cancel sync.
                        return callback.onFailure(new Error('Synchronization cancelled by onDatasetsMerged() callback returning false.'));

                    } else {

                        // Merges are handled within callback. Restart sync.
                        return root.synchronize(callback, --retry);

                    }

                });

            } else {

                // Get the last sync count so we can tell the server what to diff.

                root.local.getLastSyncCount(root.getIdentityId(), root.datasetName, function(err, syncCount) {

                    if (err) { return callback.onFailure(err); }

                    root.logger('Detecting last sync count... ' + syncCount);

                    if (syncCount == -1) {

                        // Dataset has been deleted locally
                        root.remote.deleteDataset(root.datasetName, function(err, data) {
                            if (err) { return callback.onFailure(err); }
                            root.local.purgeDataset(root.getIdentityId(), root.datasetName, function(err) {
                               if (err) { return callback.onFailure(err); }
                               return callback.onSuccess(root);
                            });
                        });

                    } else {

                        // Get all the remote records that have changed since the latest sync count.

                        root.remote.listUpdates(root.datasetName, syncCount, function(err, remoteRecords) {

                            if (err) { return callback.onFailure(err); }

                            root.logger('Fetching remote updates... found ' + remoteRecords.records.length + '.');

                            var mergedNameList = remoteRecords.getMergedDatasetNameList();

                            root.logger('Checking for remote merged datasets... found ' + mergedNameList.length + '.');

                            if (mergedNameList.length > 0) {

                                root.logger('Deferring to .onDatasetsMerged.');

                                // Merged datasets exist. Use callback to determine action.
                                return callback.onDatasetsMerged(root, mergedNameList, function(doContinue) {
                                    if (!doContinue) { callback.onFailure(new Error('Cancelled due to .onDatasetsMerged result.')); }
                                    else { root._synchronizeInternal(callback, --retry); }
                                });
                            }

                            // Check if dataset doesn't exist or is deleted.

                            if (syncCount !== 0 && !remoteRecords || remoteRecords.isDeleted()) {

                                return callback.onDatasetDeleted(root, remoteRecords.getDatasetName(), function(doContinue) {

                                    root.logger('Dataset should be deleted. Deferring to .onDatasetDeleted.');

                                    if (doContinue) {
                                        root.logger('.onDatasetDeleted returned true, purging dataset locally.');
                                        return root.local.purgeDataset(root.getIdentityId(), root.datasetName, function(err) {
                                            if (err) { return callback.onFailure(err); }
                                            return root._synchronizeInternal(callback, --retry);
                                        });
                                    } else {
                                        root.logger('.onDatasetDeleted returned false, cancelling sync.');
                                        return callback.onFailure(new Error('Cancelled due to .onDatasetDeleted result.'));
                                    }

                                });

                            }

                            var updatedRemoteRecords = remoteRecords.getRecords();
                            var lastSyncCount = remoteRecords.getSyncCount();
                            var sessionToken = remoteRecords.getSyncSessionToken();

                            // Check if there have been any updates since the last sync count.

                            root.logger('Checking for remote updates since last sync count... found ' + updatedRemoteRecords.length + '.');

                            if (updatedRemoteRecords.length > 0) {

                                root._synchronizeResolveLocal(updatedRemoteRecords, function(err, conflicts) {

                                    if (err) { return callback.onFailure(err); }

                                    root.logger('Checking for conflicts... found ' + conflicts.length + '.');

                                    if (conflicts.length > 0) {

                                        root.logger('Conflicts detected. Deferring to .onConflict.');

                                        callback.onConflict(root, conflicts, function(isContinue) {

                                            if (!isContinue) {

                                                root.logger('.onConflict returned false. Cancelling sync.');
                                                return callback.onFailure(new Error('Sync cancelled. Conflict callback returned false.'));

                                            } else {

                                                // Update remote records or we will just hit another sync conflict next go around.

                                                root._synchronizePushRemote(sessionToken, syncCount, function(){
                                                    return root.synchronize(callback, --retry);
                                                });

                                            }

                                        });

                                    } else {

                                        // No conflicts, update local records.
                                        root.logger('No conflicts. Updating local records.');

                                        root.local.putRecords(root.getIdentityId(), root.datasetName, updatedRemoteRecords, function(err) {

                                            if (err) { return callback.onFailure(err); }

                                            // Update the local sync count to match.

                                            root.local.updateLastSyncCount(root.getIdentityId(), root.datasetName, lastSyncCount, function(err) {

                                                if (err) { return callback.onFailure(err); }

                                                root.logger('Finished resolving records. Restarting sync.');

                                                // Callback returned true, starting sync.
                                                return root.synchronize(callback, --retry);

                                            });
                                        });

                                    }

                                });


                            } else {

                                // Nothing updated remotely. Push local changes to remote.
                                root.logger('Nothing updated remotely. Pushing local changes to remote.');

                                root._synchronizePushRemote(sessionToken, lastSyncCount, function(err) {

                                    if (err) {
                                        root.logger('Remote push failed. Likely concurrent sync conflict. Retrying...');
                                        return root.synchronize(callback, --retry);
                                    }

                                    root.logger('Sync successful.');
                                    return callback.onSuccess(root, updatedRemoteRecords);

                                });

                            }
                        });

                    }

                });

            }

        });
    };

    /**
     * An internal function for helping the synchronization call to resolve local conflicts.
     * @param remoteRecords
     * @param callback
     * @private
     */

    CognitoSyncDataset.prototype._synchronizeResolveLocal = function(remoteRecords, callback) {

        // Step two of the synchronization flow.
        // The dataset exists remotely so we need to determine if there are any deletions or conflicts.
        // Once everything is resolved, we update the local records.

        var root = this;
        var conflicts = [];

        // Make sure there are remote records that need resolving.

        if (remoteRecords && remoteRecords.length > 0) {

            // Get the local records so we can compare them to the remote records.

            root.local.getRecords(root.getIdentityId(), root.datasetName, function(err, localRecords) {

                var localMap = {};
                var i, key, local;

                // Build a map of the local records array for easier key lookup.

                for (i=0; i<localRecords.length; i++) {
                    localMap[localRecords[i].getKey()] = localRecords[i];
                }

                // Compare local and remote records.

                for (i=0; i<remoteRecords.length; i++) {

                    key = remoteRecords[i].getKey();
                    local = localMap[key];

                    if (local && local.isModified() && local.getValue() !== remoteRecords[i].getValue()) {
                        conflicts.push(new AWS.CognitoSyncManager.Conflict(remoteRecords[i], local));
                    }

                }

                return callback(null, conflicts);

            });

        } else {

            // There are no remote records. Nothing to resolve.
            return callback(null, conflicts);

        }

    };

    /**
     * An internal function for helping the synchronization call to push changes to the server.
     * @param sessionToken
     * @param syncCount
     * @param callback
     * @private
     */

    CognitoSyncDataset.prototype._synchronizePushRemote = function(sessionToken, syncCount, callback) {

        // Step three of the synchronization flow.
        // The local dataset has modifications so we need to push the local changes to remote.
        // Then we need to update the local metadata and update/verify the sync count.

        var root = this;

        // Push changes to remote.

        this.getModifiedRecords(function(err, localChanges) {

            if (localChanges.length > 0) {

                root.remote.putRecords(root.datasetName, localChanges, sessionToken, function(err, records) {

                    if (err) { callback(err); }

                    // Update local metadata.
                    root.local.putRecords(root.getIdentityId(), root.datasetName, records, function(err) {

                        if (err) { return callback(err); }

                        var newSyncCount = 0;

                        // Calculate new sync count.

                        for (var r in records) {
                            if (records.hasOwnProperty(r)) {
                                newSyncCount = newSyncCount < records[r].getSyncCount() ? records[r].getSyncCount() : newSyncCount;
                            }
                        }

                        root.local.updateLastSyncCount(root.getIdentityId(), root.datasetName, newSyncCount, function(err) {
                            if (err) { return callback(err); }
                            return callback(null, true);
                        });

                    });

                });

            } else {

                // Nothing to change.
                return callback(null, true);

            }

        });

    };

    return CognitoSyncDataset;

})();
