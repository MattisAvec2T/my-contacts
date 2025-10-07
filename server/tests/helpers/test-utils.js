import { vi } from 'vitest';
import { ObjectId } from 'mongodb';

/**
 * Génère un ObjectId MongoDB valide pour les tests
 */
export function generateObjectId() {
    return new ObjectId();
}

/**
 * Crée un mock de request Express
 */
export function createMockRequest(overrides = {}) {
    return {
        body: {},
        params: {},
        query: {},
        headers: {},
        userEmail: 'test@example.com',
        ...overrides
    };
}

/**
 * Crée un mock de response Express
 */
export function createMockResponse() {
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
        sendStatus: vi.fn().mockReturnThis()
    };
    return res;
}

/**
 * Crée un mock de next function
 */
export function createMockNext() {
    return vi.fn();
}

/**
 * Génère un utilisateur de test
 */
export function createTestUser(overrides = {}) {
    return {
        _id: generateObjectId(),
        email: 'test@example.com',
        password: 'hashedPassword123',
        createdAt: new Date(),
        ...overrides
    };
}

/**
 * Génère un contact de test
 */
export function createTestContact(overrides = {}) {
    return {
        _id: generateObjectId(),
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        userEmail: 'test@example.com',
        createdAt: new Date(),
        ...overrides
    };
}

/**
 * Génère un token JWT de test
 */
export function createTestToken(payload = { email: 'test@example.com' }) {
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(payload))}.signature`;
}