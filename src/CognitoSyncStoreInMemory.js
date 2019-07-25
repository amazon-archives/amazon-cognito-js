// Copyright 2014 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

AWS = AWS || {};
AWS.CognitoSyncManager = AWS.CognitoSyncManager || {};

AWS.CognitoSyncManager.StoreInMemory = (function() {

    /**
     * Storage adapter for using the browser's memory as the Cognito Sync data cache.
     * @prop {object} store A reference to an object in memory.
     * @constructor
     */

    var CognitoSyncStoreInMemory = function () {
        this.store = {};
    };

    /**
     * Constructs the key by combining the identity ID and the dataset name.
     * @param identityId
     * @param datasetName
     * @returns {string}
     */

    CognitoSyncStoreInMemory.prototype.makeKey = function (identityId, datasetName) {
        return identityId + '.' + datasetName;
    };

    /**
     * Gets an item from the local store.
     * @param identityId
     * @param datasetName
     * @param key
     * @param callback
     */

    CognitoSyncStoreInMemory.prototype.get = function (identityId, datasetName, key, callback) {

        var k = this.makeKey(identityId, datasetName);

        if (!identityId || !datasetName) {
            return callback(new Error('You must provide an identity id and dataset name.'), null);
        }

        if (this.store[k] && this.store[k][key]) {
            return callback(null, this.store[k][key]);
        }

        return callback(null, undefined);

    };

    /**
     * Gets a dataset from the local store.
     * @param identityId
     * @param datasetName
     * @param callback
     */

    CognitoSyncStoreInMemory.prototype.getAll = function (identityId, datasetName, callback) {

        var k = this.makeKey(identityId, datasetName);

        if (!identityId || !datasetName) {
            return callback(new Error('You must provide an identity id and dataset name.'), null);
        }

        return callback(null, this.store[k]);

    };

    /**
     * Sets a record in the local store.
     * @param identityId
     * @param datasetName
     * @param key
     * @param value
     * @param callback
     */

    CognitoSyncStoreInMemory.prototype.set = function (identityId, datasetName, key, value, callback) {

        var k = this.makeKey(identityId, datasetName);

        var entry = this.store[k] || {};
        entry[key] = value;

        this.store[k] = entry;

        return callback(null, entry);

    };

    /**
     * Sets an entire dataset in the local store.
     * @param identityId
     * @param datasetName
     * @param obj
     * @param callback
     */

    CognitoSyncStoreInMemory.prototype.setAll = function (identityId, datasetName, obj, callback) {

        var k = this.makeKey(identityId, datasetName);
        this.store[k] = obj;

        return callback(null, obj);

    };

    /**
     * Removes a record from the local store.
     * @param identityId
     * @param datasetName
     * @param key
     * @param callback
     */

    CognitoSyncStoreInMemory.prototype.remove = function (identityId, datasetName, key, callback) {

        var k = this.makeKey(identityId, datasetName);

        var records = JSON.parse(this.store[k]);
        if (!records) {
            records = {};
        }

        delete(records[key]);

        this.store[k] = JSON.stringify(records);

        return callback(null, true);

    };

    /**
     * Removes dataset from local store.
     * @param identityId
     * @param datasetName
     * @param callback
     */

    CognitoSyncStoreInMemory.prototype.removeAll = function (identityId, datasetName, callback) {

        var k = this.makeKey(identityId, datasetName);
        delete(this.store[k]);

        return callback(null, true);

    };

    /**
     * Clears the local store, including cached values.
     * @param callback
     */

    CognitoSyncStoreInMemory.prototype.wipe = function (callback) {
        this.store = {};
        return callback(null, true);
    };

    return CognitoSyncStoreInMemory;

})();