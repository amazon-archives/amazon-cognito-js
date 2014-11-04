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

AWS.CognitoSyncManager.StoreLocalStorage = (function() {

    /**
     * Storage adapter for using the browser's local storage as the Cognito Sync data store.
     * @prop {*} store A reference to the browser's local store.
     * @constructor
     */

    var CognitoSyncStoreLocalStorage = function () {

        this.store = window.localStorage;

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @returns {string}
     */

    CognitoSyncStoreLocalStorage.prototype.makeKey = function (identityId, datasetName) {
        return identityId + '.' + datasetName;
    };

    /**
     *
     * @param {string} identityId The identity of the data store.
     * @param {string} datasetName The name of the dataset.
     * @param {string} key The key of the record to return.
     * @param {function} callback
     * @returns {null}
     */

    CognitoSyncStoreLocalStorage.prototype.get = function (identityId, datasetName, key, callback) {

        var k = this.makeKey(identityId, datasetName);

        if (!identityId || !datasetName) {
            return callback(new Error('You must provide an identity id and dataset name.'), null);
        }

        var records = JSON.parse(this.store.getItem(k));

        if (records && records[key]) {
            return callback(null, records[key]);
        }

        return callback(null, undefined);

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param callback
     * @returns {CognitoSyncStoreLocalStorage}
     */

    CognitoSyncStoreLocalStorage.prototype.getAll = function (identityId, datasetName, callback) {

        var k = this.makeKey(identityId, datasetName);

        if (!identityId || !datasetName) {
            return callback(new Error('You must provide an identity id and dataset name.'), null);
        }

        return callback(null, JSON.parse(this.store.getItem(k)));

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param key
     * @param value
     * @param callback
     * @returns {CognitoSyncStoreLocalStorage}
     */

    CognitoSyncStoreLocalStorage.prototype.set = function (identityId, datasetName, key, value, callback) {

        var k = this.makeKey(identityId, datasetName);

        var records = JSON.parse(this.store.getItem(k));
        if (!records) {
            records = {};
        }

        records[key] = value;

        this.store.setItem(k, JSON.stringify(records));

        callback(null, records);

        return this;

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param obj
     * @param callback
     * @returns {CognitoSyncStoreLocalStorage}
     */

    CognitoSyncStoreLocalStorage.prototype.setAll = function (identityId, datasetName, obj, callback) {

        var k = this.makeKey(identityId, datasetName);

        this.store.setItem(k, JSON.stringify(obj));

        return callback(null, obj);

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param key
     * @param callback
     * @returns {CognitoSyncStoreLocalStorage}
     */

    CognitoSyncStoreLocalStorage.prototype.remove = function (identityId, datasetName, key, callback) {

        var k = this.makeKey(identityId, datasetName);

        var records = JSON.parse(this.store.getItem(k));
        if (!records) {
            records = {};
        }

        delete(records[key]);

        this.store.setItem(k, JSON.stringify(records));

        return callback(null, true);

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param callback
     */

    CognitoSyncStoreLocalStorage.prototype.removeAll = function (identityId, datasetName, callback) {

        var k = this.makeKey(identityId, datasetName);
        this.store.removeItem(k);

        return callback(null, true);

    };

    /**
     * Clears local storage, including cached
     * @param callback
     */

    CognitoSyncStoreLocalStorage.prototype.wipe = function (callback) {

        // We don't want to remove the cached identity id. Remove all other keys.

        for (var prop in this.store) {
            if (this.store.hasOwnProperty(prop)) {
                if (prop.indexOf('aws.cognito.identity') === -1) {
                    this.store.removeItem(prop);
                }
            }
        }

        if (callback) {
            return callback(null, true);
        }
        return this;

    };

    return CognitoSyncStoreLocalStorage;

})();