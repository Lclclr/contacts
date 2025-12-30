// Ensure test environment DB vars (when running tests on host with compose up)
process.env.DB_USER = process.env.DB_USER || 'user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'password';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_NAME = process.env.DB_NAME || 'contactdb';
process.env.DB_PORT = process.env.DB_PORT || '5432';

const request = require('supertest');
const app = require('../index');

describe('Server API', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('POST /api/contacts creates contact and GET returns it', async () => {
    const email = `test${Date.now()}@example.com`;
    const payload = {
      first_name: 'Test',
      last_name: 'Suite',
      email,
      cell_phone: '000-000',
      voter_precinct: 'TestPrecinct'
    };

    // POST
    const postRes = await request(app).post('/api/contacts').send(payload).set('Accept', 'application/json');
    expect(postRes.statusCode).toBe(200);
    expect(postRes.body).toHaveProperty('id');
    expect(postRes.body.email).toBe(email);

    // GET
    const getRes = await request(app).get('/api/contacts');
    expect(getRes.statusCode).toBe(200);
    // Should include the new email
    const found = getRes.body.some(c => c.email === email);
    expect(found).toBe(true);
  }, 20000);

  test('CRUD and precincts endpoints work', async () => {
    const email = `crud${Date.now()}@example.com`;
    const payload = {
      first_name: 'Crud',
      last_name: 'Tester',
      email,
      cell_phone: '111-222',
      voter_precinct: 'CrudPrecinct'
    };

    // Create
    const postRes = await request(app).post('/api/contacts').send(payload).set('Accept', 'application/json');
    expect(postRes.statusCode).toBe(200);
    const created = postRes.body;
    expect(created).toHaveProperty('id');

    // Get by ID
    const getById = await request(app).get(`/api/contacts/${created.id}`);
    expect(getById.statusCode).toBe(200);
    expect(getById.body.email).toBe(email);

    // Update
    const upd = { ...payload, first_name: 'CrudUpdated' };
    const putRes = await request(app).put(`/api/contacts/${created.id}`).send(upd).set('Accept', 'application/json');
    expect(putRes.statusCode).toBe(200);
    expect(putRes.body.first_name).toBe('CrudUpdated');

    // Precincts list should include our precinct
    const precincts = await request(app).get('/api/precincts');
    expect(precincts.statusCode).toBe(200);
    expect(Array.isArray(precincts.body)).toBe(true);
    expect(precincts.body).toContain('CrudPrecinct');

    // Filter by precinct
    const filtered = await request(app).get('/api/contacts').query({ precinct: 'CrudPrecinct' });
    expect(filtered.statusCode).toBe(200);
    expect(filtered.body.some(c => c.id === created.id)).toBe(true);

    // Delete
    const delRes = await request(app).delete(`/api/contacts/${created.id}`);
    expect(delRes.statusCode).toBe(200);

    const afterDel = await request(app).get(`/api/contacts/${created.id}`);
    expect(afterDel.statusCode).toBe(404);
  }, 30000);

  afterAll(async () => {
    // close DB pool so Jest can exit cleanly
    if (app && app.locals && app.locals.pool) {
      await app.locals.pool.end();
    }
  });
});