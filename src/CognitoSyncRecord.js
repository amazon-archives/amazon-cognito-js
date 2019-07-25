// Copyright 2014 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

AWS = AWS || {};
AWS.CognitoSyncManager = AWS.CognitoSyncManager || {};

AWS.CognitoSyncManager.Record = (function() {

    /**
     * Constructs a new remote storage class.
     * @param {Object} data
     * @param {string} data.Key - The record's key
     * @param {string} data.Value - The record's key
     * @param {number} data.SyncCount
     * @param {Date} data.LastModifiedDate
     * @param {string} data.LastModifiedBy
     * @param {Date} data.DeviceLastModifiedDate
     * @param {boolean} data.Modified
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
     * Returns the record's key.
     * @returns {string}
     */

    CognitoSyncRecord.prototype.getKey = function () {
        return this.key;
    };

    /**
     * Sets the record's key.
     * @param key
     * @returns {CognitoSyncRecord}
     */

    CognitoSyncRecord.prototype.setKey = function (key) {
        this.key = key;
        return this;
    };

    /**
     * Returns the record's value.
     * @returns {string}
     */

    CognitoSyncRecord.prototype.getValue = function () {
        return this.value;
    };

    /**
     * Sets the record's value.
     * @param value
     * @returns {CognitoSyncRecord}
     */

    CognitoSyncRecord.prototype.setValue = function (value) {
        this.value = value;
        return this;
    };

    /**
     * Returns the current sync count.
     * @returns {number}
     */

    CognitoSyncRecord.prototype.getSyncCount = function () {
        return this.syncCount;
    };

    /**
     * Sets the current sync count.
     * @param syncCount
     * @returns {CognitoSyncRecord}
     */

    CognitoSyncRecord.prototype.setSyncCount = function (syncCount) {
        this.syncCount = syncCount;
        return this;
    };

    /**
     * Returns the date the record was last modified.
     * @returns {Date}
     */

    CognitoSyncRecord.prototype.getLastModifiedDate = function () {
        return new Date(this.lastModifiedDate);
    };

    /**
     * Sets the date the record was last modified.
     * @param modifiedDate
     * @returns {CognitoSyncRecord}
     */

    CognitoSyncRecord.prototype.setLastModifiedDate = function (modifiedDate) {
        this.lastModifiedDate = new Date(modifiedDate);
        return this;
    };

    /**
     * Returns the user/device who last modified the record.
     * @returns {string}
     */

    CognitoSyncRecord.prototype.getLastModifiedBy = function () {
        return this.lastModifiedBy;
    };

    /**
     * Sets the user/device who last modified the record.
     * @param modifiedBy
     * @returns {CognitoSyncRecord}
     */

    CognitoSyncRecord.prototype.setLastModifiedBy = function (modifiedBy) {
        this.lastModifiedBy = modifiedBy;
        return this;
    };

    /**
     * Returns the date when the record was last modified on the local device.
     * @returns {Date}
     */

    CognitoSyncRecord.prototype.getDeviceLastModifiedDate = function () {
        return new Date(this.deviceLastModifiedDate);
    };

    /**
     * Sets the date when the record was last modified on the local device.
     * @param modifiedDate
     * @returns {CognitoSyncRecord}
     */

    CognitoSyncRecord.prototype.setDeviceLastModifiedDate = function (modifiedDate) {
        this.deviceLastModifiedDate = new Date(modifiedDate);
        return this;
    };

    /**
     * Returns if the record has been modified.
     * @returns {boolean}
     */

    CognitoSyncRecord.prototype.isModified = function () {
        return this.modified;
    };

    /**
     * Sets if the record has been modified.
     * @param modified
     * @returns {CognitoSyncRecord}
     */

    CognitoSyncRecord.prototype.setModified = function (modified) {
        this.modified = modified;
        return this;
    };

    /**
     * Returns if the record has been deleted locally.
     * @returns {boolean}
     */

    CognitoSyncRecord.prototype.isDeleted = function () {
        return this.value === null;
    };

    /**
     * Returns a string representation of the record.
     * @returns {string}
     */

    CognitoSyncRecord.prototype.toString = function () {
        return JSON.stringify(this);
    };

    /**
     * Returns a flat object representing the record.
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
