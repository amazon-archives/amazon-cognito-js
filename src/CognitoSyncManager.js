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

if (AWS === undefined) {
    throw new Error("AWS SDK must be loaded before loading the Sync Manager.");
} else {

    /**
     * Constructs a new Cognito Sync Manager class.
     * @constructor
     */


    AWS.CognitoSyncManager = function (options) {

        options = options || {};

        var USER_AGENT = 'CognitoJavaScriptSDK/1';

        this.provider = AWS.config.credentials;
        this.identityPoolId = this.provider.params.IdentityPoolId;
        this.region = AWS.config.region;

        // Setup logger.
        this.logger = options.log;
        if (typeof this.logger !== 'function') {
            this.logger = function () {
            };
        }

        // Initialize local store.
        this.local = new AWS.CognitoSyncManager.LocalStorage({DataStore: options.DataStore ? options.DataStore : AWS.CognitoSyncManager.StoreLocalStorage});

        // Initialize remote store.
        this.remote = new AWS.CognitoSyncManager.RemoteStorage(this.identityPoolId, this.provider);
        this.remote.setUserAgent(USER_AGENT);

    };

    /**
     * Returns a dataset object, creating it if it doesn't already exist.
     * @param {string} datasetName
     * @param {function} callback
     */

    AWS.CognitoSyncManager.prototype.openOrCreateDataset = function (datasetName, callback) {

        var root = this;
        var namePattern = new RegExp('^[a-zA-Z0-9_.:-]{1,128}$');

        // Validate the proposed dataset name.

        if (namePattern.test(datasetName)) {

            this.local.createDataset(this.getIdentityId(), datasetName, function (err, data) {
                if (err) {
                    return callback(err, null);
                }
                callback(null, new AWS.CognitoSyncManager.Dataset(data, root.provider, root.local, root.remote, root.logger));
            });

        } else {

            callback(new Error('Dataset name must match the pattern ' + namePattern.toString()));

        }

    };

    /**
     * Returns a list of datasets.
     * @param {function} callback
     */

    AWS.CognitoSyncManager.prototype.listDatasets = function (callback) {
        this.local.getDatasets(this.getIdentityId(), callback);
    };

    /**
     * Replaces the local dataset metadata with the latest remote metadata.
     * @param callback
     */

    AWS.CognitoSyncManager.prototype.refreshDatasetMetadata = function (callback) {

        var root = this;

        this.remote.getDatasets(function (err, datasets) {

            var metadata = [];

            var request = function (ds) {
                root.local.updateDatasetMetadata(root.getIdentityId(), ds, response);
            };

            var response = function (err, md) {
                metadata.push(md);
                if (datasets.length > 0) {
                    request(datasets.shift());
                }
                else {
                    callback(null, metadata);
                }
            };

            if (datasets.length > 0) {
                request(datasets.shift(), callback);
            } else {
                callback(null, []);
            }

        });
    };

    /**
     * Removes the local storage and invalidates the cached identity id.
     */

    AWS.CognitoSyncManager.prototype.wipeData = function () {
        this.provider.clearCachedId();
        this.local.wipeData();
    };

    /**
     * Returns the cached identity id.
     * @returns {string}
     */

    AWS.CognitoSyncManager.prototype.getIdentityId = function () {
        return this.provider.identityId;
    };

}