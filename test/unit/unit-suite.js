import { googleStorageTests } from "./approach-1/google-storage.test.js";
import { storageFactoryTests } from "./approach-1/storage-factory.test.js";

export const unitTestSuite = function() {
    describe('Unit Tests', () => {

        describe('Approach-1', () => {
            storageFactoryTests();
            googleStorageTests();
        });
        
    });
}