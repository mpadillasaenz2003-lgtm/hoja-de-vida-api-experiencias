const express = require('express');
const mongoose = require('mongoose');
const Experiencia = require('../models/experiencia');

const requiredFields = ['empresa', 'cargo', 'fechaInicio', 'descripcion'];
const allowedFields = new Set([
  ...requiredFields,
  'ubicacion',
  'fechaFin',
  'actual',
  'tecnologias',
]);

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === value;
}

function validatePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: ['El cuerpo de la solicitud debe ser un objeto JSON.'] };
  }

  for (const field of Object.keys(body)) {
    if (!allowedFields.has(field)) {
      errors.push(`El campo "${field}" no está permitido.`);
    }
  }

  for (const field of requiredFields) {
    if (typeof body[field] !== 'string' || !body[field].trim()) {
      errors.push(`El campo "${field}" es obligatorio y debe ser texto.`);
    }
  }

  for (const field of ['ubicacion', 'fechaFin']) {
    if (body[field] !== undefined && typeof body[field] !== 'string') {
      errors.push(`El campo "${field}" debe ser texto.`);
    }
  }

  for (const field of ['fechaInicio', 'fechaFin']) {
    if (body[field] !== undefined && !isValidDate(body[field])) {
      errors.push(`El campo "${field}" debe ser una fecha válida en formato AAAA-MM-DD.`);
    }
  }

  if (
    body.fechaInicio &&
    body.fechaFin &&
    Date.parse(body.fechaFin) < Date.parse(body.fechaInicio)
  ) {
    errors.push('La fecha de finalización no puede ser anterior a la fecha de inicio.');
  }

  if (body.actual !== undefined && typeof body.actual !== 'boolean') {
    errors.push('El campo "actual" debe ser booleano.');
  }

  if (body.actual === true && body.fechaFin) {
    errors.push('Una experiencia actual no debe tener fecha de finalización.');
  }

  if (
    body.tecnologias !== undefined &&
    (!Array.isArray(body.tecnologias) ||
      body.tecnologias.some((tecnologia) => typeof tecnologia !== 'string'))
  ) {
    errors.push('El campo "tecnologias" debe ser una lista de textos.');
  }

  return { errors };
}

function responseExperience(body) {
  return {
    empresa: body.empresa.trim(),
    cargo: body.cargo.trim(),
    ubicacion: body.ubicacion ? body.ubicacion.trim() : '',
    fechaInicio: body.fechaInicio,
    ...(body.fechaFin ? { fechaFin: body.fechaFin } : {}),
    actual: body.actual === true,
    descripcion: body.descripcion.trim(),
    tecnologias: body.tecnologias
      ? body.tecnologias.map((tecnologia) => tecnologia.trim())
      : [],
  };
}

function invalidId(id) {
  return !mongoose.isValidObjectId(id);
}

module.exports = (experienceModel = Experiencia) => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const experiencias = await experienceModel.find().sort({ fechaInicio: -1 });
    res.json({ data: experiencias });
  });

  router.post('/', async (req, res) => {
    const { errors } = validatePayload(req.body);
    if (errors.length) {
      return res.status(400).json({ error: 'Datos inválidos.', detalles: errors });
    }

    const experiencia = await experienceModel.create(responseExperience(req.body));
    return res.status(201).json({ data: experiencia });
  });

  router.get('/:id', async (req, res) => {
    if (invalidId(req.params.id)) {
      return res.status(400).json({ error: 'El identificador no es válido.' });
    }

    const experiencia = await experienceModel.findById(req.params.id);
    if (!experiencia) {
      return res.status(404).json({ error: 'Experiencia no encontrada.' });
    }

    return res.json({ data: experiencia });
  });

  router.put('/:id', async (req, res) => {
    if (invalidId(req.params.id)) {
      return res.status(400).json({ error: 'El identificador no es válido.' });
    }

    const { errors } = validatePayload(req.body);
    if (errors.length) {
      return res.status(400).json({ error: 'Datos inválidos.', detalles: errors });
    }

    const values = responseExperience(req.body);
    const update = { $set: values };
    if (!Object.hasOwn(values, 'fechaFin')) {
      update.$unset = { fechaFin: 1 };
    }

    const experiencia = await experienceModel.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!experiencia) {
      return res.status(404).json({ error: 'Experiencia no encontrada.' });
    }

    return res.json({ data: experiencia });
  });

  router.delete('/:id', async (req, res) => {
    if (invalidId(req.params.id)) {
      return res.status(400).json({ error: 'El identificador no es válido.' });
    }

    const experiencia = await experienceModel.findByIdAndDelete(req.params.id);
    if (!experiencia) {
      return res.status(404).json({ error: 'Experiencia no encontrada.' });
    }

    return res.status(204).end();
  });

  return router;
};
