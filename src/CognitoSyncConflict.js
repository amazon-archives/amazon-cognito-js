// Copyright 2014 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

AWS = AWS || {};
AWS.CognitoSyncManager = AWS.CognitoSyncManager || {};

AWS.CognitoSyncManager.Conflict = (function() {

    /**
     * When the local and remote copies of a dataset are in conflict, this object is returned to the synchronize callback.
     * @param remoteRecord the record from remote storage
     * @param localRecord the record from local storage
     * @prop {string} key
     * @prop {CognitoSyncRecord} remoteRecord
     * @prop {CognitoSyncRecord} localRecord
     * @constructor
     */

    var CognitoSyncConflict = function(remoteRecord, localRecord) {

        if (!remoteRecord || !localRecord) { throw new Error('Remote and local records cannot be null.'); }
        if (!remoteRecord.getKey || !localRecord.getKey) { throw new Error('Records are not record objects.'); }
        if (remoteRecord.getKey() !== localRecord.getKey()) { throw new Error('Remote and local keys do not match.'); }

        this.key = remoteRecord.getKey();
        this.remoteRecord = remoteRecord;
        this.localRecord = localRecord;

    };

    /**
     * Get the key of the records in conflict.
     * @returns {string} the record's key
     */

    CognitoSyncConflict.prototype.getKey = function() {
        return this.key;
    };

    /**
     * Get the remote record that is in conflict.
     * @returns {CognitoSyncRecord} the record
     */

    CognitoSyncConflict.prototype.getRemoteRecord = function() {
        return this.remoteRecord;
    };

    /**
     * Get the local record that is in conflict.
     * @returns {CognitoSyncRecord} the record
     */

    CognitoSyncConflict.prototype.getLocalRecord = function() {
        return this.localRecord;
    };

    /**
     * Resolves conflict with remote record.
     * @returns {CognitoSyncRecord} the resulting record
     */

    CognitoSyncConflict.prototype.resolveWithRemoteRecord = function() {
        this.remoteRecord.setModified(false);
        return this.remoteRecord;
    };

    /**
     * Resolves conflict with local record.
     * @returns {CognitoSyncRecord} resolved record
     */

    CognitoSyncConflict.prototype.resolveWithLocalRecord = function() {
        this.localRecord.setSyncCount(this.remoteRecord.getSyncCount());
        this.localRecord.setModified(true);
        return this.localRecord;
    };

    /**
     * Resolves conflict with a new value.
     * @param newValue new value of the record
     * @returns {CognitoSyncRecord} resolved record
     */

    CognitoSyncConflict.prototype.resolveWithValue = function(newValue) {
        return new AWS.CognitoSyncManager.Record({
            Key: this.remoteRecord.getKey(),
            Value: newValue,
            SyncCount: this.remoteRecord.getSyncCount(),
            LastModifiedDate: new Date(),
            LastModifiedBy: this.localRecord.getLastModifiedBy(),
            DeviceLastModifiedDate: new Date(),
            Modified: true
        });
    };

    return CognitoSyncConflict;

})();