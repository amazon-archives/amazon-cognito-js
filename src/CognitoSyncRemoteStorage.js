// Copyright 2014 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

AWS = AWS || {};
AWS.CognitoSyncManager = AWS.CognitoSyncManager || {};

AWS.CognitoSyncManager.RemoteStorage = (function() {

    /**
     * Constructs a new remote storage class.
     * @param {string} identityPoolId
     * @param provider
     * @constructor
     */

    var CognitoSyncRemoteStorage = function (identityPoolId, provider) {

        this.identityPoolId = identityPoolId;
        this.provider = provider;
        this.client = new AWS.CognitoSync();

    };

    CognitoSyncRemoteStorage.prototype.userAgent = '';

    /**
     * Gets the current identity ID from the AWS credentials provider.
     * @returns {string}
     */

    CognitoSyncRemoteStorage.prototype.getIdentityId = function () {
        return this.provider.identityId;
    };

    /**
     * Returns a list of datasets.
     * @param {function} callback Callback(Error, Datasets)
     */

    CognitoSyncRemoteStorage.prototype.getDatasets = function (callback) {

        var root = this;
        var datasets = [];
        var nextToken = null;

        // Define the request function. Will be called once per page of results.

        var fetch = function (token, cb) {
            root.client.listDatasets({
                IdentityId: root.getIdentityId(),
                IdentityPoolId: root.identityPoolId,
                MaxResults: 64,
                NextToken: token
            }, cb);
        };

        // Define the response function. Will be called after each request returns.

        var process = function (err, data) {

            var results = data.Datasets || [];

            // Add the new page of results to the list of datasets.

            for (var i = 0; i < results.length; i++) {
                datasets.push(new AWS.CognitoSyncManager.DatasetMetadata(results[i]));
            }

            // Get the NextToken. If it exists, fetch the next page of results, otherwise callback.

            nextToken = data.NextToken;

            if (nextToken) {
                fetch(nextToken, process);
            }
            else {
                callback(null, datasets);
            }

        };

        // Start the first fetch.

        fetch(nextToken, process);

    };

    /**
     * Lists all updates on the remote store since the given sync count.
     * @param {string} datasetName
     * @param {number} lastSyncCount
     * @param {function} callback Callback(Error, Updates)
     */

    CognitoSyncRemoteStorage.prototype.listUpdates = function (datasetName, lastSyncCount, callback) {

        var root = this;
        var nextToken = null;
        var updatedRecords = new AWS.CognitoSyncManager.DatasetUpdates(datasetName);

        var request = function (token, cb) {
            root.client.listRecords({
                DatasetName: datasetName,
                IdentityId: root.getIdentityId(),
                IdentityPoolId: root.identityPoolId,
                LastSyncCount: lastSyncCount,
                MaxResults: 1024,
                NextToken: token
            }, cb);
        };

        var response = function (err, data) {

            if (err) { return callback(err); }

            data = data || {};

            var results = data.Records || [], r;

            for (var i = 0; i < results.length; i++) {
                r = new AWS.CognitoSyncManager.Record(results[i]);
                r.setModified(false);
                updatedRecords.addRecord(r);
            }

            updatedRecords.setSyncSessionToken(data.SyncSessionToken)
                .setSyncCount(data.DatasetSyncCount)
                .setExists(data.DatasetExists)
                .setDeleted(data.DatasetDeletedAfterRequestedSyncCount);

            if (data.MergedDatasetNames) {
                updatedRecords.setMergedDatasetNameList(data.MergedDatasetNames);
            }

            nextToken = data.NextToken;

            if (nextToken) {
                request(nextToken, response);
            } else {
                callback(null, updatedRecords);
            }

        };


        request(null, response);

    };

    /**
     * Write records to the remote data store.
     * @param {string} datasetName
     * @param {array} records
     * @param {string} syncSessionToken
     * @param {function} callback
     */

    CognitoSyncRemoteStorage.prototype.putRecords = function (datasetName, records, syncSessionToken, callback) {

        var root = this;

        var patches = [];
        var record;

        for (var r in records) {
            if (records.hasOwnProperty(r)) {

                record = records[r];

                patches.push({
                    Key: record.getKey(),
                    Op: record.getValue() ? 'replace' : 'remove',
                    SyncCount: record.getSyncCount(),
                    DeviceLastModifiedDate: record.getDeviceLastModifiedDate(),
                    Value: record.getValue()
                });

            }
        }

        this.client.updateRecords({
            DatasetName: datasetName,
            IdentityId: root.getIdentityId(),
            IdentityPoolId: root.identityPoolId,
            SyncSessionToken: syncSessionToken,
            RecordPatches: patches
        }, function (err, data) {

            var dsName = typeof datasetName === 'string' ? datasetName : '(invalid dataset name)';

            if (err) {
                return callback(new Error('Failed to update records in dataset: ' + dsName + ' (' + err.message + ')'), null);
            }

            var records = [], r;

            for (var i = 0; i < data.Records.length; i++) {
                r = new AWS.CognitoSyncManager.Record(data.Records[i]);
                r.setModified(false);
                records.push(r);
            }

            return callback(null, records);

        });

    };

    /**
     * Delete the dataset from the remote data store.
     * @param {string} datasetName
     * @param {function} callback Callback(Error, IsSuccessful)
     */

    CognitoSyncRemoteStorage.prototype.deleteDataset = function (datasetName, callback) {

        this.client.deleteDataset({
            DatasetName: datasetName,
            IdentityId: this.getIdentityId(),
            IdentityPoolId: this.identityPoolId
        }, function (err, data) {

            if (err) {
                return callback(new Error('Failed to delete dataset.'), null);
            }

            return callback(null, data);

        });

    };

    /**
     * Gets the dataset metdata from the remote data store.
     * @param {string} datasetName
     * @param {function} callback Callback(Error, Metadata)
     */

    CognitoSyncRemoteStorage.prototype.getDatasetMetadata = function (datasetName, callback) {

        this.client.describeDataset({
            DatasetName: datasetName,
            IdentityId: this.getIdentityId(),
            IdentityPoolId: this.identityPoolId
        }, function (err, data) {

            if (err) {
                return callback(new Error('Failed to get dataset metadata.'), null);
            }

            return callback(null, new AWS.CognitoSyncManager.DatasetMetadata(data.Dataset));

        });

    };

    CognitoSyncRemoteStorage.prototype.setUserAgent = function (userAgent) {
        this.userAgent = userAgent;
    };

    return CognitoSyncRemoteStorage;

})();