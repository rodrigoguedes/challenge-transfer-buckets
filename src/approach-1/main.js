import { CloudStorageFactory } from "./storage-factory.js";

const MAX_CONCURRENT_TRANSFERS = 500; //100

async function transferFiles(sourceBucketName, destinationBucketName) {

    const fileStream = storageProvider.getFilesStream(sourceBucketName);

    const sourceBucket = await storageProvider.getBucket(sourceBucketName);
    const destinationBucket = await storageProvider.getBucket(destinationBucketName);    
    
    const runningTasks = [];

    fileStream.on('data', file => {
        const task = async () => {
            await storageProvider.copyFile(sourceBucket, file.name, destinationBucket, file.name);
        };

        const promise = task().finally(() => {
            runningTasks.splice(runningTasks.indexOf(promise), 1);
        });
        runningTasks.push(promise);

        if (runningTasks.length >= MAX_CONCURRENT_TRANSFERS) {
            fileStream.pause();  // Pause the stream if the limit is reached
            Promise.race(runningTasks).then(() => fileStream.resume());  // Resume the stream once a task is finished
        }
    });

    fileStream.on('end', async () => {
        await Promise.all(runningTasks);  // Wait for all running tasks to complete
        console.log('All files have been processed.');
    });

    fileStream.on('error', err => {
        console.error('Error reading files from source bucket:', err);
    });
}

const srcBucketName = process.argv[2];
const destBucketName = process.argv[3];

if (!srcBucketName || !destBucketName) {
    console.error('Usage: node main.js <source-bucket-name> <destination-bucket-name>');
    process.exit(1);
}

const sufixProvider = srcBucketName.substring(0, srcBucketName.indexOf("://"));

const storageProvider = CloudStorageFactory.getStorageProvider(sufixProvider)

transferFiles(srcBucketName, destBucketName).catch(err => {
    console.error('Error transferring files:', err);
});