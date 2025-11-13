import request from 'supertest';
import app from '../index';

describe('POST /freeze and GET /freeze/:childId', () => {
  it('can set and read freeze state for a child', async () => {
    // Set freeze
    const freezeRes = await request(app)
      .post('/freeze')
      .send({ childId: 'child-1', reason: 'test' })
      .set('Accept', 'application/json');

    expect(freezeRes.status).toBe(200);
    expect(freezeRes.body).toHaveProperty('status');

    // Read freeze state
    const getRes = await request(app).get('/freeze/child-1');
    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveProperty('frozen');
  });

  it('returns 400 when childId is missing on POST /freeze', async () => {
    const res = await request(app)
      .post('/freeze')
      .send({ reason: 'test' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('returns frozen state for a child on GET /freeze/:childId', async () => {
    const res = await request(app)
      .get('/freeze/child-999')
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('frozen');
    expect(typeof res.body.frozen).toBe('boolean');
  });

  it('can unfreeze a child on POST /freeze/unfreeze', async () => {
    // First freeze
    await request(app)
      .post('/freeze')
      .send({ childId: 'child-2', reason: 'test' })
      .set('Accept', 'application/json');

    // Then unfreeze - route is /freeze/unfreeze when mounted
    const unfreezeRes = await request(app)
      .post('/freeze/unfreeze')
      .send({ childId: 'child-2' })
      .set('Accept', 'application/json');

    expect(unfreezeRes.status).toBe(200);
    expect(unfreezeRes.body.status).toBe('unfrozen');
  });
});
