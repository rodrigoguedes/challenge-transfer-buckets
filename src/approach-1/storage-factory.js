import { GoogleStorage } from "./google-storage.js";

export class CloudStorageFactory {
    static getStorageProvider(providerName) {
        switch (providerName.toLowerCase()) {
            case 'gs':
                return new GoogleStorage();
            default:
                throw new Error(`Unsupported storage provider: ${providerName}`);
        }
    }
}
