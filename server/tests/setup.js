import { vi } from 'vitest';

// Mock de la configuration d'environnement
vi.mock('../src/config/env.config.js', () => ({
    PORT: 3000,
    JWT_SECRET: 'test-secret-key',
    JWT_EXPIRES_IN: 3600,
    MONGO_URI: 'mongodb://localhost:27017/test'
}));

// Mock de la base de données
vi.mock('../src/config/database.config.js', () => {
    const mockCollection = {
        findOne: vi.fn(),
        find: vi.fn(() => ({
            toArray: vi.fn().mockResolvedValue([])
        })),
        insertOne: vi.fn(),
        updateOne: vi.fn(),
        deleteOne: vi.fn(),
        createIndex: vi.fn()
    };

    const mockDatabase = {
        collection: vi.fn(() => mockCollection)
    };

    return {
        default: mockDatabase
    };
});

// Configuration globale
global.console = {
    ...console,
    log: vi.fn(),
    error: console.error,
    warn: console.warn,
    info: vi.fn(),
    debug: vi.fn()
};
