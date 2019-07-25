// Copyright 2014 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

AWS = AWS || {};
AWS.CognitoSyncManager = AWS.CognitoSyncManager || {};

AWS.CognitoSyncManager.DatasetUpdates = (function() {

    /**
     * Constructs a new dataset update class.
     * @param datasetName
     * @constructor
     */

    var CognitoSyncDatasetUpdates = function (datasetName) {

        this.datasetName = datasetName;
        this.records = [];
        this.syncCount = 0;
        this.syncSessionToken = '';
        this.exists = true;
        this.deleted = false;
        this.mergedDatasetNameList = [];

    };

    CognitoSyncDatasetUpdates.prototype.getDatasetName = function () {
        return this.datasetName;
    };

    CognitoSyncDatasetUpdates.prototype.setDatasetName = function (datasetName) {
        this.datasetName = datasetName;
        return this;
    };

    CognitoSyncDatasetUpdates.prototype.getRecords = function () {
        return this.records;
    };

    CognitoSyncDatasetUpdates.prototype.addRecord = function (record) {
        this.records.push(record);
        return this;
    };

    CognitoSyncDatasetUpdates.prototype.getSyncCount = function () {
        return this.syncCount;
    };

    CognitoSyncDatasetUpdates.prototype.setSyncCount = function (syncCount) {
        this.syncCount = syncCount;
        return this;
    };

    CognitoSyncDatasetUpdates.prototype.getSyncSessionToken = function () {
        return this.syncSessionToken;
    };

    CognitoSyncDatasetUpdates.prototype.setSyncSessionToken = function (syncToken) {
        this.syncSessionToken = syncToken;
        return this;
    };

    CognitoSyncDatasetUpdates.prototype.isExists = function () {
        return this.exists;
    };

    CognitoSyncDatasetUpdates.prototype.setExists = function (exists) {
        this.exists = exists;
        return this;
    };

    CognitoSyncDatasetUpdates.prototype.isDeleted = function () {
        return this.deleted;
    };

    CognitoSyncDatasetUpdates.prototype.setDeleted = function (deleted) {
        this.deleted = deleted;
        return this;
    };

    CognitoSyncDatasetUpdates.prototype.getMergedDatasetNameList = function () {
        return this.mergedDatasetNameList;
    };

    CognitoSyncDatasetUpdates.prototype.setMergedDatasetNameList = function (mergedList) {
        this.mergedDatasetNameList = mergedList;
        return this;
    };

    return CognitoSyncDatasetUpdates;

})();
