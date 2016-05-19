# Amazon Cognito Sync Manager for JavaScript

**Developer Preview:** We welcome developer feedback on this project. You can reach us by creating an issue on the GitHub repository or post to the Amazon Cognito forums:

* https://github.com/aws/amazon-cognito-js/issues
* https://forums.aws.amazon.com/forum.jspa?forumID=173

Introduction
============

The Cognito Sync Manager for JavaScript allows your web application to store data in the cloud for your users and
synchronize across other devices. The library uses the browser's local storage API to create a local cache for the
data, similar to our [mobile SDK](http://aws.amazon.com/mobile/sdk/). This allows your web application to access stored data even when there is no
connectivity.

**Note:** This library is designed to run in the browser. It has not been tested for use in other environments.

## Setup

1. Download and include the AWS JavaScript SDK:
  * http://aws.amazon.com/sdk-for-browser/

2. Download and include the Cognito Sync Manager for JavaScript:
  * [/dist/amazon-cognito.min.js](https://github.com/aws/amazon-cognito-js/blob/master/dist/amazon-cognito.min.js)

## Usage

**Step 1.** Log into Amazon Cognito management console and create a new identity pool. Be sure to enable the "unauthenticated
identities" option. On the last step of the wizard, make a note of your Account ID, Identity Pool ID, and
Unauthenticated Role ARN.

* https://console.aws.amazon.com/cognito/home/?region=us-east-1

**Step 2.** Instantiate the AWS JavaScript SDK using the AWS.CognitoIdentityCredentials class, using the information you
gathered from the previous step.

```javascript
AWS.config.region = 'us-east-1';

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'YOUR IDENTITY POOL ID',
});
```

**Step 3.** Make the call to obtain the credentials you configured, and in the callback, instantiate the CognitoSyncManager
class. It will assume the credentials from the AWS SDK.

```javascript
AWS.config.credentials.get(function() {

    client = new AWS.CognitoSyncManager();

    // YOUR CODE HERE

});
```

**Step 4.** Now you need to open or create a new dataset to start saving data to. Call .openOrCreateDataset() and pass in the
desired dataset name.

```javascript
client.openOrCreateDataset('myDatasetName', function(err, dataset) {

   // Do something with the dataset here.

});
```

**Step 5.** Once you have the dataset object, you can write, read, and delete records to that dataset. It is also possible to [get all the records](https://github.com/raptortech-js/amazon-cognito-js/blob/master/src/CognitoSyncDataset.js#L93) from a given dataset, [get the amount of data used](https://github.com/raptortech-js/amazon-cognito-js/blob/master/src/CognitoSyncDataset.js#L102) by a dataset, and [more](https://github.com/raptortech-js/amazon-cognito-js/blob/master/src/CognitoSyncDataset.js).

```javascript
<!-- Read Records -->
dataset.get('myRecord', function(err, value) {
  console.log('myRecord: ' + value);
});

<!-- Write Records -->
dataset.put('newRecord', 'newValue', function(err, record) {
  console.log(record);
});

<!-- Delete Records -->
dataset.remove('oldKey', function(err, record) {
  if (!err) { console.log('success'); }
});
```

**Step 6.** Finally, synchronize the data to Cognito. You pass the synchronize function an object with callbacks to handle the
various outcomes: onSuccess, onFailure, onConflict, onDatasetMerged, onDatasetDeleted.

```javascript
<!-- Synchronize -->
dataset.synchronize({

  onSuccess: function(dataset, newRecords) {
     //...
  },

  onFailure: function(err) {
     //...
  },

  onConflict: function(dataset, conflicts, callback) {

     var resolved = [];

     for (var i=0; i<conflicts.length; i++) {

        // Take remote version.
        resolved.push(conflicts[i].resolveWithRemoteRecord());

        // Or... take local version.
        // resolved.push(conflicts[i].resolveWithLocalRecord());

        // Or... use custom logic.
        // var newValue = conflicts[i].getRemoteRecord().getValue() + conflicts[i].getLocalRecord().getValue();
        // resolved.push(conflicts[i].resolveWithValue(newValue);

     }

     dataset.resolve(resolved, function() {
        return callback(true);
     });
     
     // Or... callback false to stop the synchronization process.
     // return callback(false);

  },

  onDatasetDeleted: function(dataset, datasetName, callback) {

     // Return true to delete the local copy of the dataset.
     // Return false to handle deleted datasets outsid ethe synchronization callback.

     return callback(true);

  },

  onDatasetMerged: function(dataset, datasetNames, callback) {

     // Return true to continue the synchronization process.
     // Return false to handle dataset merges outside the synchroniziation callback.

     return callback(false);

  }

});
```

## Change Log

**v1.0.0:**
* Initial release. Developer preview.
