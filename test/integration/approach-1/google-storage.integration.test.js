import { expect } from 'chai';
import { Storage } from '@google-cloud/storage';
import { GoogleStorage } from '../../../src/approach-1/google-storage.js';

export const googleStorageIntegrationTests = function() {

    describe('Cloud Storage', function() {
        this.timeout(60000); // 60 seconds timeout for integration tests

        const storage = new Storage();

        const BUCKET_SOURCE = 'rguedes-test-src'
        const BUCKET_DESTINATION = 'rguedes-test-dest'

        before(async () => {
            await storage.createBucket(BUCKET_SOURCE, {
                location: 'us-east1',
                storageClass: "STANDARD"
            });

            await storage.bucket(BUCKET_SOURCE).upload('test/resource/test.txt');

            await storage.createBucket(BUCKET_DESTINATION, {
                location: 'us-east1',
                storageClass: "STANDARD"
            });
        });

        after(async () => {
            await storage.bucket(BUCKET_SOURCE).deleteFiles();
            await storage.bucket(BUCKET_SOURCE).delete();
            await storage.bucket(BUCKET_DESTINATION).deleteFiles();
            await storage.bucket(BUCKET_DESTINATION).delete();
        });

        it('should transfer files from Google Cloud Storage to Google Cloud Storage', async () => {
            const cloudStorage = new GoogleStorage();
    
            const sourceBucket  = await storage.bucket(BUCKET_SOURCE);
            const destBucket  = await storage.bucket(BUCKET_DESTINATION);

            await cloudStorage.copyFile(sourceBucket, 'test.txt', destBucket, 'test.txt');

            const fileStream = cloudStorage.getFilesStream(BUCKET_DESTINATION);

            fileStream.on('data', file => {
                expect(file.name).to.equal('test.txt');
            });
        });

    });

}