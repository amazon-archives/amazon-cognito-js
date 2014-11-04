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

AWS.CognitoSyncManager.StoreInMemory = (function() {

    /**
     *
     * @constructor
     */

    var CognitoSyncStoreInMemory = function () {
        this.store = {};
    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @returns {string}
     */

    CognitoSyncStoreInMemory.prototype.makeKey = function (identityId, datasetName) {
        return identityId + '.' + datasetName;
    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param key
     * @param callback
     * @returns {CognitoSyncStoreInMemory}
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
     *
     * @param identityId
     * @param datasetName
     * @param callback
     * @returns {CognitoSyncStoreInMemory}
     */

    CognitoSyncStoreInMemory.prototype.getAll = function (identityId, datasetName, callback) {

        var k = this.makeKey(identityId, datasetName);

        if (!identityId || !datasetName) {
            return callback(new Error('You must provide an identity id and dataset name.'), null);
        }

        return callback(null, this.store[k]);

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param key
     * @param value
     * @param callback
     * @returns {CognitoSyncStoreInMemory}
     */

    CognitoSyncStoreInMemory.prototype.set = function (identityId, datasetName, key, value, callback) {

        var k = this.makeKey(identityId, datasetName);

        var entry = this.store[k] || {};
        entry[key] = value;

        this.store[k] = entry;

        return callback(null, entry);

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param obj
     * @param callback
     * @returns {CognitoSyncStoreInMemory}
     */

    CognitoSyncStoreInMemory.prototype.setAll = function (identityId, datasetName, obj, callback) {

        var k = this.makeKey(identityId, datasetName);
        this.store[k] = obj;

        return callback(null, obj);

    };

    /**
     *
     * @param identityId
     * @param datasetName
     * @param key
     * @param callback
     * @returns {CognitoSyncStoreInMemory}
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
     *
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
     *
     * @param callback
     */

    CognitoSyncStoreInMemory.prototype.wipe = function (callback) {
        this.store = {};
        return callback(null, true);
    };

    return CognitoSyncStoreInMemory;

})();