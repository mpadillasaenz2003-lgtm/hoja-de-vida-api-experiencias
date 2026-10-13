const express = require('express');
const swaggerUi = require('swagger-ui-express');
const experienciasRouter = require('./routes/experiencias');
const openapi = require('./openapi');

function createApp({ experienceModel } = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api-docs.json', (req, res) => {
    res.json(openapi);
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));
  app.use('/api/experiencias', experienciasRouter(experienceModel));

  app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada.' });
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }

    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({ error: 'El cuerpo debe contener JSON válido.' });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Datos inválidos.',
        detalles: Object.values(error.errors).map((item) => item.message),
      });
    }

    console.error('Error al procesar la solicitud:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  });

  return app;
}

module.exports = createApp;
