import { googleStorageIntegrationTests } from "./approach-1/google-storage.integration.test.js";

export const integrationTestSuite = function() {
    describe('Integrations Tests', () => {

        describe('Approach-1', () => {
            googleStorageIntegrationTests();
        });

    });
}