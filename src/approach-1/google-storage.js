import { Storage } from "@google-cloud/storage";
import { CloudStorage } from "./cloud-storage.js";

const MAX_RETRIES = 5;
const INITIAL_BACKOFF = 1000; // 1 second

export class GoogleStorage extends CloudStorage {

    constructor() {
        super();
        this.storage = new Storage();
    }

    getFilesStream(bucketName) {
        return this.storage.bucket(bucketName).getFilesStream();
    }

    async getBucket(bucketName) {
        const bucket = this.storage.bucket(bucketName);

        const response = await bucket.exists();

        if (response[0]) {
            return bucket;
        }

        throw Error(`Bucket "${bucketName}" not found.`);
    }

    async copyFile(sourceBucket, sourceFileName, destinationBucket, destinationFileName) {
        const srcFile = sourceBucket.file(sourceFileName);
        const destFile = destinationBucket.file(destinationFileName);
        
        console.log(`Copying ${sourceBucket.cloudStorageURI.href}/${srcFile.name} to ${destinationBucket.cloudStorageURI.href}/${destFile.name}`);

        await this.copyFileWithRetry(srcFile, destFile);
    }

    async copyFileWithRetry(sourceFile, destinationFile, retries = MAX_RETRIES, backoff = INITIAL_BACKOFF) {
        try {
            await sourceFile.copy(destinationFile);
        } catch (err) {
            if (retries > 0) {
                console.log(`Error to copy file, retrying in ${backoff}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                await this.copyFileWithRetry(sourceFile, destinationFile, retries - 1, backoff * 2); // Exponential backoff
            }
        }
    }

}
