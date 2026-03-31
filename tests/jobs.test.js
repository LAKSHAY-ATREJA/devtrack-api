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
  });

  it('lists jobs with pagination metadata', async () => {
    await auth(request(app).post('/api/jobs')).send(sampleJob);
    const res = await auth(request(app).get('/api/jobs'));

    expect(res.statusCode).toBe(200);
    expect(res.body.jobs).toHaveLength(1);
    expect(res.body.total).toBe(1);
  });

  it('filters jobs by status', async () => {
    await auth(request(app).post('/api/jobs')).send(sampleJob);
    await auth(request(app).post('/api/jobs')).send({ ...sampleJob, status: 'offer' });

    const res = await auth(request(app).get('/api/jobs?status=offer'));
    expect(res.body.jobs).toHaveLength(1);
    expect(res.body.jobs[0].status).toBe('offer');
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

  it('returns 404 for another user\'s job', async () => {
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
});
