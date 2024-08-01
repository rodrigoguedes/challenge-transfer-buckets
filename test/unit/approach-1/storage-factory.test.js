import { expect } from 'chai';
import { CloudStorageFactory } from '../../../src/approach-1/storage-factory.js';
import { GoogleStorage } from '../../../src/approach-1/google-storage.js';

export const storageFactoryTests = function() {
    describe('StorageFactory', () => {
        it('should return an instance of GoogleCloudStorage for provider "google"', () => {
            const provider = CloudStorageFactory.getStorageProvider('gs');
            expect(provider).to.be.instanceOf(GoogleStorage);
        });

        it('should throw an error for an unsupported provider', () => {
            expect(() => CloudStorageFactory.getStorageProvider('unsupported')).to.throw('Unsupported storage provider: unsupported');
        });
    });
}