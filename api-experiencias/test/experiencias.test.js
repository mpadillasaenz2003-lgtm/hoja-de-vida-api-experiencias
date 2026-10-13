const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const createApp = require('../src/app');
const Experiencia = require('../src/models/experiencia');

const id = '507f1f77bcf86cd799439011';
const missingId = '507f1f77bcf86cd799439012';
let records;
let server;
let baseUrl;

const experienceModel = {
  find() {
    return {
      sort() {
        return Promise.resolve([...records.values()]);
      },
    };
  },
  async create(body) {
    const record = {
      ...body,
      _id: id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.set(id, record);
    return record;
  },
  async findById(recordId) {
    return records.get(recordId) || null;
  },
  async findByIdAndUpdate(recordId, update) {
    if (!records.has(recordId)) return null;
    const record = { ...records.get(recordId), ...update.$set, _id: recordId };
    if (update.$unset) {
      for (const field of Object.keys(update.$unset)) delete record[field];
    }
    records.set(recordId, record);
    return record;
  },
  async findByIdAndDelete(recordId) {
    const record = records.get(recordId) || null;
    records.delete(recordId);
    return record;
  },
};

const payload = {
  empresa: 'Empresa de ejemplo',
  cargo: 'Desarrollador',
  fechaInicio: '2023-01-15',
  fechaFin: '2024-06-30',
  actual: false,
  descripcion: 'Desarrollo de aplicaciones web.',
  tecnologias: ['Node.js', 'MongoDB'],
};

before(async () => {
  records = new Map();
  server = createApp({ experienceModel }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('GET /api/health confirma que la API está activa', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('POST crea una experiencia y GET lista y consulta por id', async () => {
  const createdResponse = await fetch(`${baseUrl}/api/experiencias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  assert.equal(createdResponse.status, 201);
  assert.equal((await createdResponse.json()).data.empresa, payload.empresa);

  const listResponse = await fetch(`${baseUrl}/api/experiencias`);
  assert.equal((await listResponse.json()).data.length, 1);

  const getResponse = await fetch(`${baseUrl}/api/experiencias/${id}`);
  assert.equal(getResponse.status, 200);
  assert.equal((await getResponse.json()).data._id, id);
});

test('POST rechaza datos incompletos, fechas invertidas y campos desconocidos', async () => {
  const invalidBodies = [
    { empresa: 'Sin los campos requeridos' },
    { ...payload, fechaFin: '2022-01-01' },
    { ...payload, fechaInicio: '2023-02-31' },
    { ...payload, administrador: true },
  ];

  for (const body of invalidBodies) {
    const response = await fetch(`${baseUrl}/api/experiencias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, 'Datos inválidos.');
  }
});

test('PUT actualiza y DELETE elimina una experiencia', async () => {
  const updateResponse = await fetch(`${baseUrl}/api/experiencias/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, cargo: 'Líder técnico' }),
  });
  assert.equal(updateResponse.status, 200);
  assert.equal((await updateResponse.json()).data.cargo, 'Líder técnico');

  const deleteResponse = await fetch(`${baseUrl}/api/experiencias/${id}`, {
    method: 'DELETE',
  });
  assert.equal(deleteResponse.status, 204);
  assert.equal(records.has(id), false);
});

test('PUT elimina la fecha de fin anterior cuando reemplaza una experiencia actual', async () => {
  await fetch(`${baseUrl}/api/experiencias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const updateResponse = await fetch(`${baseUrl}/api/experiencias/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      actual: true,
      fechaFin: undefined,
    }),
  });
  const updatedExperience = (await updateResponse.json()).data;
  assert.equal(updateResponse.status, 200);
  assert.equal(updatedExperience.actual, true);
  assert.equal('fechaFin' in updatedExperience, false);

  records.clear();
});

test('Swagger publica la documentación y define los endpoints CRUD', async () => {
  const response = await fetch(`${baseUrl}/api-docs.json`);
  const specification = await response.json();

  assert.equal(response.status, 200);
  assert.equal(specification.openapi, '3.0.3');
  assert.ok(specification.paths['/api/experiencias'].get);
  assert.ok(specification.paths['/api/experiencias'].post);
  assert.ok(specification.paths['/api/experiencias/{id}'].put);
  assert.ok(specification.paths['/api/experiencias/{id}'].delete);
});

test('Swagger UI sirve la página interactiva', async () => {
  const response = await fetch(`${baseUrl}/api-docs/`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /swagger-ui/);
});

test('el modelo MongoDB valida campos obligatorios y rango de fechas', async () => {
  const experiencia = new Experiencia({
    empresa: '',
    cargo: 'Desarrollador',
    fechaInicio: '2024-06-01',
    fechaFin: '2024-05-01',
    descripcion: 'Experiencia de prueba',
  });

  await assert.rejects(experiencia.validate(), (error) => {
    assert.ok(error.errors.empresa);
    assert.ok(error.errors.fechaFin);
    return true;
  });
});

test('los identificadores inválidos responden 400 y los registros inexistentes 404', async () => {
  const invalidResponse = await fetch(`${baseUrl}/api/experiencias/no-es-un-id`);
  assert.equal(invalidResponse.status, 400);

  const missingResponse = await fetch(`${baseUrl}/api/experiencias/${missingId}`);
  assert.equal(missingResponse.status, 404);
});
