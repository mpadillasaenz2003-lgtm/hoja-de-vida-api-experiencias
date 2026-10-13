require('dotenv').config();
const mongoose = require('mongoose');
const createApp = require('./app');

const port = Number(process.env.PORT) || 3000;
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('Falta configurar MONGODB_URI. Copia .env.example a .env y configura MongoDB.');
  process.exit(1);
}

async function start() {
  await mongoose.connect(mongoUri);
  const app = createApp();
  const server = app.listen(port, () => {
    console.log(`API disponible en http://localhost:${port}`);
    console.log(`Documentación Swagger en http://localhost:${port}/api-docs`);
  });

  async function shutdown() {
    server.close(async (error) => {
      if (error) {
        console.error('No se pudo cerrar el servidor correctamente:', error);
        process.exitCode = 1;
      }
      await mongoose.disconnect();
    });
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('No se pudo iniciar la API o conectar con MongoDB:', error);
  process.exitCode = 1;
});
