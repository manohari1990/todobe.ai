import {
    describe,
    afterAll,
    test,
    expect
} from '@jest/globals';
import 'dotenv/config';
import { pool } from '../../src/config/database.js';

describe('DB connection pool', () => {
    test('should connect to PostgreSQL database', async () => {
        const result = await pool.query(
            'SELECT current_database() AS db_name'
        );
        expect(result.rows[0].db_name).toBe(process.env.DB_NAME);
    });
    afterAll(async () => {
        await pool.end();
    });
});