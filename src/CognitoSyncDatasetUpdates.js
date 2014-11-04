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
