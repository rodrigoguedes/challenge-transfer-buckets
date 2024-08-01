import { expect } from 'chai';
import sinon from 'sinon';
import { Storage } from '@google-cloud/storage';
import { GoogleStorage } from '../../../src/approach-1/google-storage.js';

export const googleStorageTests = function() {
    describe('GoogleStorage', () => {
        let googleStorage;
        let storageStub;
    
        beforeEach(() => {
            googleStorage = new GoogleStorage();
            storageStub = sinon.stub(Storage.prototype, 'bucket');
        });
    
        afterEach(() => {
            sinon.restore();
        });
    
        it('should get files stream from the bucket', () => {
            const bucketName = 'test-bucket';
            const fakeStream = {};
            const bucket = { getFilesStream: sinon.stub().returns(fakeStream) };
    
            storageStub.withArgs(bucketName).returns(bucket);
    
            const result = googleStorage.getFilesStream(bucketName);
    
            expect(result).to.equal(fakeStream);
        });
    
        it('should return the bucket if it exists', async () => {
            const bucketName = 'test-bucket';
            const bucket = { exists: sinon.stub().resolves([true]) };
    
            storageStub.withArgs(bucketName).returns(bucket);
    
            const result = await googleStorage.getBucket(bucketName);
    
            expect(result).to.equal(bucket);
        });
    
        it('should throw an error if the bucket does not exist', async () => {
            const bucketName = 'test-bucket';
            const bucket = { exists: sinon.stub().resolves([false]) };
    
            storageStub.withArgs(bucketName).returns(bucket);
    
            try {
                await googleStorage.getBucket(bucketName);
            } catch (err) {
                expect(err.message).to.equal(`Bucket "${bucketName}" not found.`);
            }
        });
    
        it('should copy file with retries', async () => {
            const sourceBucket = { file: sinon.stub().returns({}), cloudStorageURI: { href: 'src' } };
            const destinationBucket = { file: sinon.stub().returns({}), cloudStorageURI: { href: 'dist' }  };
    
            storageStub.withArgs('source-bucket').returns(sourceBucket);
            storageStub.withArgs('destination-bucket').returns(destinationBucket);
    
            googleStorage.copyFileWithRetry = sinon.stub().resolves();
    
            await googleStorage.copyFile(sourceBucket, 'source-file', destinationBucket, 'destination-file');
    
            expect(googleStorage.copyFileWithRetry.called).to.be.true;
        });
    });
}