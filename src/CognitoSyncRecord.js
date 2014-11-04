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

AWS.CognitoSyncManager.Record = (function() {

    /**
     *
     * @param {Object} data
     * @param {string} data.Key - The record's key
     * @param {string} data.Value - The record's key
     * @param {number} data.SyncCount
     * @param {Date} data.LastModifiedDate
     * @param {string} data.LastModifiedBy
     * @param {Date} data.DeviceLastModifiedDate
     * @param {boolean} data.Modified
     * @prop {string} key
     * @prop {string} value
     * @prop {number} syncCount
     * @prop {Date} lastModifiedDate
     * @prop {string} lastModifiedBy
     * @prop {Date} deviceLastModifiedDate
     * @prop {boolean} modified
     * @constructor
     */

    var CognitoSyncRecord = function (data) {

        data = data || {};

        // Assign object
        this.key = data.Key || '';
        this.value = data.Value || '';
        this.syncCount = data.SyncCount || 0;
        this.lastModifiedDate = data.LastModifiedDate ? new Date(data.LastModifiedDate) : new Date();
        this.lastModifiedBy = data.LastModifiedBy || '';
        this.deviceLastModifiedDate = data.DeviceLastModifiedDate ? new Date(data.DeviceLastModifiedDate) : new Date();
        this.modified = data.Modified || false;

    };

    /**
     *
     * @returns {string}
     */

    CognitoSyncRecord.prototype.getKey = function () {
        return this.key;
    };

    /**
     *
     * @param key
     * @returns {CognitoSyncRecord}
     */

    CognitoSyncRecord.prototype.setKey = function (key) {
        this.key = key;
        return this;
    };

    /**
     *
     * @returns {string}
     */

    CognitoSyncRecord.prototype.getValue = function () {
        return this.value;
    };

    /**
     *
     * @param value
     * @returns {CognitoSyncRecord}
     */

    CognitoSyncRecord.prototype.setValue = function (value) {
        this.value = value;
        return this;
    };

    /**
     *
     * @returns {number}
     */

    CognitoSyncRecord.prototype.getSyncCount = function () {
        return this.syncCount;
    };

    /**
     *
     * @param syncCount
     * @returns {CognitoSyncRecord}
     */

    CognitoSyncRecord.prototype.setSyncCount = function (syncCount) {
        this.syncCount = syncCount;
        return this;
    };

    /**
     *
     * @returns {Date}
     */

    CognitoSyncRecord.prototype.getLastModifiedDate = function () {
        return new Date(this.lastModifiedDate);
    };

    /**
     *
     * @param modifiedDate
     * @returns {CognitoSyncRecord}
     */

    CognitoSyncRecord.prototype.setLastModifiedDate = function (modifiedDate) {
        this.lastModifiedDate = new Date(modifiedDate);
        return this;
    };

    /**
     *
     * @returns {string}
     */

    CognitoSyncRecord.prototype.getLastModifiedBy = function () {
        return this.lastModifiedBy;
    };

    /**
     *
     * @param modifiedBy
     * @returns {CognitoSyncRecord}
     */

    CognitoSyncRecord.prototype.setLastModifiedBy = function (modifiedBy) {
        this.lastModifiedBy = modifiedBy;
        return this;
    };

    /**
     *
     * @returns {Date}
     */

    CognitoSyncRecord.prototype.getDeviceLastModifiedDate = function () {
        return new Date(this.deviceLastModifiedDate);
    };

    /**
     *
     * @param modifiedDate
     * @returns {CognitoSyncRecord}
     */

    CognitoSyncRecord.prototype.setDeviceLastModifiedDate = function (modifiedDate) {
        this.deviceLastModifiedDate = new Date(modifiedDate);
        return this;
    };

    /**
     *
     * @returns {boolean}
     */

    CognitoSyncRecord.prototype.isModified = function () {
        return this.modified;
    };

    /**
     *
     * @param modified
     * @returns {CognitoSyncRecord}
     */

    CognitoSyncRecord.prototype.setModified = function (modified) {
        this.modified = modified;
        return this;
    };

    /**
     *
     * @returns {boolean}
     */

    CognitoSyncRecord.prototype.isDeleted = function () {
        return this.value === null;
    };

    /**
     *
     * @returns {string}
     */

    CognitoSyncRecord.prototype.toString = function () {
        return JSON.stringify(this);
    };

    /**
     *
     * @returns {object}
     */

    CognitoSyncRecord.prototype.toJSON = function () {
        return {
            Key: this.key,
            Value: this.value,
            SyncCount: this.syncCount,
            LastModifiedDate: this.lastModifiedDate,
            LastModifiedBy: this.lastModifiedBy,
            DeviceLastModifiedDate: this.deviceLastModifiedDate,
            Modified: this.modified
        };
    };

    return CognitoSyncRecord;

})();