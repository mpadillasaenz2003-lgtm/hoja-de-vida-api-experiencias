# API de experiencias profesionales

Actividad: API REST para administrar las experiencias profesionales de una hoja de vida, desarrollada con **Node.js, Express y MongoDB**.

## Mejoras realizadas

- CRUD completo para crear, listar, consultar, actualizar y eliminar experiencias.
- Persistencia en MongoDB usando Mongoose.
- Validación de datos y respuestas de error para solicitudes inválidas o registros inexistentes.
- Documentación interactiva OpenAPI/Swagger para explorar y probar los endpoints.
- Pruebas automatizadas de operaciones CRUD, validaciones y documentación.
- Credenciales configuradas en `.env`, excluido de Git para proteger la conexión a la base de datos.

## Ejecutar

Requisitos: Node.js 20.19 o superior y una instancia local de MongoDB o MongoDB Atlas.

Desde PowerShell:

```powershell
cd api-experiencias
npm install
Copy-Item .env.example .env
```

Configura `MONGODB_URI` en `.env` con la URI de tu base de datos y ejecuta:

```powershell
npm run dev
```

La base `hoja_de_vida` y la colección se crean al guardar el primer documento.

## Endpoints y pruebas

| Método | Endpoint | Acción |
|---|---|---|
| GET | `/api/experiencias` | Listar experiencias |
| GET | `/api/experiencias/:id` | Consultar por ID |
| POST | `/api/experiencias` | Crear experiencia |
| PUT | `/api/experiencias/:id` | Actualizar experiencia |
| DELETE | `/api/experiencias/:id` | Eliminar experiencia |

Con el servidor activo, abre **http://localhost:3000/api-docs** y usa **Try it out** para probar cada endpoint. Para ejecutar las pruebas automatizadas:

```powershell
npm test
```

Las pruebas automatizadas no requieren conexión a MongoDB. La API es un servidor Node.js; publicar solo los archivos estáticos en Netlify no despliega el servidor Express.
