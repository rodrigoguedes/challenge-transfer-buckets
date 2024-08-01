export class CloudStorage {

    async getFilesStream(bucketName) {
        throw new Error('getFilesStream() must be implemented');
    }

    async copyFile(sourceBucket, sourceFile, destinationBucket, destinationFile) {
        throw new Error('copyFile() must be implemented');
    }

    getBucket() {
        throw new Error('getBucket() must be implemented');
    }
}
