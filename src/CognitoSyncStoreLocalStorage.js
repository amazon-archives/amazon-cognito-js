// Copyright 2014 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

AWS = AWS || {};
AWS.CognitoSyncManager = AWS.CognitoSyncManager || {};

AWS.CognitoSyncManager.StoreLocalStorage = (function() {

    /**
     * Storage adapter for using the browser's local storage as the Cognito Sync data cache.
     * @prop {window.localStorage} store A reference to the browser's local storage API.
     * @constructor
     */

    var CognitoSyncStoreLocalStorage = function () {
        this.store = window.localStorage;
    };

    /**
     * Constructs the key by combining the identity ID and the dataset name.
     * @param {string} identityId
     * @param {string} datasetName
     * @returns {string}
     */

    CognitoSyncStoreLocalStorage.prototype.makeKey = function (identityId, datasetName) {
        return identityId + '.' + datasetName;
    };

    /**
     * Returns a value from local storage.
     * @param {string} identityId The identity that owns the dataset.
     * @param {string} datasetName The name of the dataset.
     * @param {string} key The key of the record to return.
     * @param {function} callback
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
     * Gets all records from local storage.
     * @param identityId
     * @param datasetName
     * @param callback Callback(Error, Items)
     */

    CognitoSyncStoreLocalStorage.prototype.getAll = function (identityId, datasetName, callback) {

        var k = this.makeKey(identityId, datasetName);

        if (!identityId || !datasetName) {
            return callback(new Error('You must provide an identity id and dataset name.'), null);
        }

        return callback(null, JSON.parse(this.store.getItem(k)));

    };

    /**
     * Sets a value in local storage.
     * @param identityId
     * @param datasetName
     * @param key
     * @param value
     * @param callback Callback(Error, Records)
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
     * Sets all values of a dataset.
     * @param identityId
     * @param datasetName
     * @param obj
     * @param callback Callback(Error, Object)
     */

    CognitoSyncStoreLocalStorage.prototype.setAll = function (identityId, datasetName, obj, callback) {

        var k = this.makeKey(identityId, datasetName);

        this.store.setItem(k, JSON.stringify(obj));

        return callback(null, obj);

    };

    /**
     * Removes an item from local storage.
     * @param identityId
     * @param datasetName
     * @param key
     * @param callback
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
     * Removes dataset from local storage.
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
     * Clears local storage, including cached values.
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