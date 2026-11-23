require('./setup');
const request = require('supertest');
const app = require('../src/app');

let token;

const sampleJob = {
  company: 'Atlassian',
  position: 'Graduate Software Engineer',
  status: 'applied',
  location: 'Brisbane, QLD',
};

beforeEach(async () => {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Job Tester',
    email: 'jobs@example.com',
    password: 'password123',
  });
  token = res.body.token;
});

const auth = (req) => req.set('Authorization', `Bearer ${token}`);

describe('Job CRUD', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.statusCode).toBe(401);
  });

  it('creates a job', async () => {
    const res = await auth(request(app).post('/api/jobs')).send(sampleJob);

    expect(res.statusCode).toBe(201);
    expect(res.body.job.company).toBe(sampleJob.company);
    expect(res.body.job.position).toBe(sampleJob.position);
    expect(res.body.job.status).toBe(sampleJob.status);
  });

  it('replays an idempotent create without duplicating the job', async () => {
    const key = 'application-create-001';
    const first = await auth(request(app).post('/api/jobs'))
      .set('Idempotency-Key', key)
      .send(sampleJob);
    const replay = await auth(request(app).post('/api/jobs'))
      .set('Idempotency-Key', key)
      .send(sampleJob);

    expect(first.statusCode).toBe(201);
    expect(replay.statusCode).toBe(200);
    expect(replay.headers['idempotency-replayed']).toBe('true');
    expect(replay.body.job._id).toBe(first.body.job._id);
    expect(replay.body.job.idempotencyKey).toBeUndefined();

    const list = await auth(request(app).get('/api/jobs'));
    expect(list.body.jobs).toHaveLength(1);
  });

  it('rejects reuse of an idempotency key with a different payload', async () => {
    const key = 'application-create-002';
    await auth(request(app).post('/api/jobs'))
      .set('Idempotency-Key', key)
      .send(sampleJob);
    const conflict = await auth(request(app).post('/api/jobs'))
      .set('Idempotency-Key', key)
      .send({ ...sampleJob, company: 'Canva' });

    expect(conflict.statusCode).toBe(409);
    expect(conflict.body.error).toMatch(/different request/);
  });

  it('collapses concurrent creates with the same idempotency key', async () => {
    const key = 'application-create-race-001';
    const responses = await Promise.all([
      auth(request(app).post('/api/jobs')).set('Idempotency-Key', key).send(sampleJob),
      auth(request(app).post('/api/jobs')).set('Idempotency-Key', key).send(sampleJob),
    ]);

    expect(responses.map((response) => response.statusCode).sort()).toEqual([200, 201]);
    expect(new Set(responses.map((response) => response.body.job._id)).size).toBe(1);

    const list = await auth(request(app).get('/api/jobs'));
    expect(list.body.jobs).toHaveLength(1);
  });

  it('scopes idempotency keys to the authenticated user', async () => {
    const key = 'shared-application-key';
    const first = await auth(request(app).post('/api/jobs'))
      .set('Idempotency-Key', key)
      .send(sampleJob);
    const other = await request(app).post('/api/auth/register').send({
      name: 'Other User',
      email: 'idempotency-other@example.com',
      password: 'password123',
    });
    const second = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${other.body.token}`)
      .set('Idempotency-Key', key)
      .send(sampleJob);

    expect(first.statusCode).toBe(201);
    expect(second.statusCode).toBe(201);
    expect(second.body.job._id).not.toBe(first.body.job._id);
  });

  it('validates the idempotency key before writing', async () => {
    const res = await auth(request(app).post('/api/jobs'))
      .set('Idempotency-Key', 'short')
      .send(sampleJob);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/between 8 and 128/);
  });

  it('rejects job creation with missing required fields', async () => {
    const res = await auth(request(app).post('/api/jobs')).send({ company: 'Acme' });
    expect(res.statusCode).toBe(400);
  });

  it('rejects job creation with invalid status', async () => {
    const res = await auth(request(app).post('/api/jobs')).send({
      ...sampleJob,
      status: 'pending',
    });
    expect(res.statusCode).toBe(400);
  });

  it('lists jobs with pagination metadata', async () => {
    await auth(request(app).post('/api/jobs')).send(sampleJob);
    const res = await auth(request(app).get('/api/jobs'));

    expect(res.statusCode).toBe(200);
    expect(res.body.jobs).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(1);
    expect(res.body.pages).toBeDefined();
  });

  it('filters jobs by status', async () => {
    await auth(request(app).post('/api/jobs')).send(sampleJob);
    await auth(request(app).post('/api/jobs')).send({ ...sampleJob, status: 'offer' });

    const res = await auth(request(app).get('/api/jobs?status=offer'));
    expect(res.body.jobs).toHaveLength(1);
    expect(res.body.jobs[0].status).toBe('offer');
  });

  it('rejects invalid status filter', async () => {
    const res = await auth(request(app).get('/api/jobs?status=invalid'));
    expect(res.statusCode).toBe(400);
  });

  it('gets a single job by id', async () => {
    const created = await auth(request(app).post('/api/jobs')).send(sampleJob);
    const res = await auth(request(app).get(`/api/jobs/${created.body.job._id}`));

    expect(res.statusCode).toBe(200);
    expect(res.body.job._id).toBe(created.body.job._id);
  });

  it('updates a job', async () => {
    const created = await auth(request(app).post('/api/jobs')).send(sampleJob);
    const res = await auth(
      request(app).patch(`/api/jobs/${created.body.job._id}`)
    ).send({ status: 'interview' });

    expect(res.statusCode).toBe(200);
    expect(res.body.job.status).toBe('interview');
  });

  it('deletes a job', async () => {
    const created = await auth(request(app).post('/api/jobs')).send(sampleJob);
    const res = await auth(request(app).delete(`/api/jobs/${created.body.job._id}`));

    expect(res.statusCode).toBe(200);

    const list = await auth(request(app).get('/api/jobs'));
    expect(list.body.jobs).toHaveLength(0);
  });

  it("returns 404 for another user's job", async () => {
    const created = await auth(request(app).post('/api/jobs')).send(sampleJob);

    const other = await request(app).post('/api/auth/register').send({
      name: 'Other User',
      email: 'other@example.com',
      password: 'password123',
    });

    const res = await request(app)
      .get(`/api/jobs/${created.body.job._id}`)
      .set('Authorization', `Bearer ${other.body.token}`);

    expect(res.statusCode).toBe(404);
  });

  it('returns 400 for invalid job id format', async () => {
    const res = await auth(request(app).get('/api/jobs/not-a-valid-id'));
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/jobs/stats', () => {
  it('returns stats with zero counts when no jobs exist', async () => {
    const res = await auth(request(app).get('/api/jobs/stats'));

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.applied).toBe(0);
  });

  it('returns correct counts after creating jobs', async () => {
    await auth(request(app).post('/api/jobs')).send(sampleJob);
    await auth(request(app).post('/api/jobs')).send({ ...sampleJob, status: 'interview' });
    await auth(request(app).post('/api/jobs')).send({ ...sampleJob, status: 'offer' });

    const res = await auth(request(app).get('/api/jobs/stats'));

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.stats.applied).toBe(1);
    expect(res.body.stats.interview).toBe(1);
    expect(res.body.stats.offer).toBe(1);
  });
});
