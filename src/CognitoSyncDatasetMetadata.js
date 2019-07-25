// Copyright 2014 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Constructs a new CognitoSyncDatasetMetadata object.
 * @param metadata the serialized metadata
 * @constructor
 */

AWS = AWS || {};
AWS.CognitoSyncManager = AWS.CognitoSyncManager || {};

AWS.CognitoSyncManager.DatasetMetadata = (function(){

    var CognitoSyncDatasetMetadata = function(metadata) {

        metadata = metadata || {};

        // Assign object.
        this.datasetName = metadata.DatasetName || '';
        this.creationDate = new Date(metadata.CreationDate) || new Date();
        this.lastModifiedDate = new Date(metadata.LastModifiedDate) || new Date();
        this.lastModifiedBy = metadata.LastModifiedBy || '';
        this.dataStorage = metadata.DataStorage || 0;
        this.recordCount = metadata.NumRecords || 0;

        // Meta metadata.
        this.lastSyncCount = metadata.LastSyncCount || 0;
        this.lastSyncDate = metadata.LastSyncDate ? new Date(metadata.LastSyncDate) : new Date();

        // Validate object.
        if (this.dataStorage < 0) { throw new RangeError('Storage size cannot be negative.'); }
        if (this.recordCount < 0) { throw new RangeError('Record count cannot be negative.'); }

    };

    /**
     * Get the dataset name.
     * @returns {string} the dataset's name.
     */

    CognitoSyncDatasetMetadata.prototype.getDatasetName = function() {
        return this.datasetName;
    };

    /**
     * Sets the dataset name.
     * @param {string} datasetName the name of the dataset
     * @returns {CognitoSyncDatasetMetadata} the dataset object
     */

    CognitoSyncDatasetMetadata.prototype.setDatasetName = function(datasetName) {
        this.datasetName = datasetName;
        return this;
    };

    /**
     * Get the dataset's creation date.
     * @returns {Date} the creation date
     */

    CognitoSyncDatasetMetadata.prototype.getCreationDate = function() {
        return this.creationDate;
    };

    /**
     * Sets the dataset creation date.
     * @param {Date} creationDate
     * @returns {CognitoSyncDatasetMetadata}
     */

    CognitoSyncDatasetMetadata.prototype.setCreationDate = function(creationDate) {
        this.creationDate = new Date(creationDate);
        return this;
    };

    /**
     * Gets the dataset last modified date.
     * @returns {Date}
     */

    CognitoSyncDatasetMetadata.prototype.getLastModifiedDate = function() {
        return this.lastModifiedDate;
    };

    /**
     * Sets the dataset last modified date.
     * @param modifiedDate
     * @returns {CognitoSyncDatasetMetadata}
     */

    CognitoSyncDatasetMetadata.prototype.setLastModifiedDate = function(modifiedDate) {
        this.lastModifiedDate = new Date(modifiedDate);
        return this;
    };

    /**
     * Returns the user/device who last modified the dataset.
     * @returns {String}
     */

    CognitoSyncDatasetMetadata.prototype.getLastModifiedBy = function() {
        return this.lastModifiedBy;
    };

    /**
     * Sets the user/device who last modified the dataset.
     * @param {String} modifiedBy
     * @returns {CognitoSyncDatasetMetadata}
     */

    CognitoSyncDatasetMetadata.prototype.setLastModifiedBy = function(modifiedBy) {
        this.lastModifiedBy = modifiedBy;
        return this;
    };

    /**
     * Gets the data storage size.
     * @returns {number}
     */

    CognitoSyncDatasetMetadata.prototype.getDataStorage = function() {
        return this.dataStorage;
    };

    /**
     * Sets the data storage size.
     * @param {Number} storageSize
     * @returns {CognitoSyncDatasetMetadata}
     */

    CognitoSyncDatasetMetadata.prototype.setDataStorage = function(storageSize) {
        this.dataStorage = storageSize;
        return this;
    };

    /**
     * Gets the record count.
     * @returns {number}
     */

    CognitoSyncDatasetMetadata.prototype.getRecordCount = function() {
        return this.recordCount;
    };

    /**
     * Sets the record count.
     * @param {Number} recordCount
     * @returns {CognitoSyncDatasetMetadata}
     */

    CognitoSyncDatasetMetadata.prototype.setRecordCount = function(recordCount) {
        this.recordCount = recordCount;
        return this;
    };

    /**
     * Gets the last sync count.
     * @returns {number}
     */

    CognitoSyncDatasetMetadata.prototype.getLastSyncCount = function() {
        return this.lastSyncCount;
    };

    /**
     * Sets the last sync count.
     * @param {Number} syncCount
     * @returns {CognitoSyncDatasetMetadata}
     */

    CognitoSyncDatasetMetadata.prototype.setLastSyncCount = function(syncCount) {
        this.lastSyncCount = syncCount;
        return this;
    };

    /**
     * Gets the last sync date.
     * @returns {Date}
     */

    CognitoSyncDatasetMetadata.prototype.getLastSyncDate = function() {
        return this.lastSyncDate;
    };

    /**
     * Sets the last sync date.
     * @param {Date} syncDate
     * @returns {CognitoSyncDatasetMetadata}
     */

    CognitoSyncDatasetMetadata.prototype.setLastSyncDate = function(syncDate) {
        this.lastSyncDate = syncDate;
        return this;
    };

    /**
     * Returns a JSON string of the metadata object.
     * @returns {String}
     */

    CognitoSyncDatasetMetadata.prototype.toString = function() {
        return JSON.stringify(this.toJSON());
    };

    /**
     * Returns a flat object representing the metadata.
     * @returns {Object}
     */

    CognitoSyncDatasetMetadata.prototype.toJSON = function() {
        return {
            DatasetName: this.datasetName,
            CreationDate: this.creationDate,
            LastModifiedDate: this.lastModifiedDate,
            LastModifiedBy: this.lastModifiedBy,
            DataStorage: this.dataStorage,
            NumRecords: this.recordCount,
            LastSyncCount: this.lastSyncCount,
            LastSyncDate: this.lastSyncDate
        };
    };

    return CognitoSyncDatasetMetadata;

})();
