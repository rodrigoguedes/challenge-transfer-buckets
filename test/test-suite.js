import { integrationTestSuite } from "./integration/integrations-suite.js";
import { unitTestSuite } from "./unit/unit-suite.js";

describe('Tests', () => {
    unitTestSuite();
    integrationTestSuite();
});