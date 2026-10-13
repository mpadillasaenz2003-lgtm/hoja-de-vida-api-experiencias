# API de experiencias profesionales

API REST de hoja de vida desarrollada con Node.js, Express 5 y MongoDB mediante Mongoose. Permite crear, consultar, actualizar y eliminar experiencias profesionales.

## Requisitos

- Node.js 20.19 o superior.
- MongoDB local o una instancia de MongoDB Atlas.

## Instalación y ejecución

Desde esta carpeta:

```bash
npm install
```

Copia `.env.example` como `.env` y ajusta `MONGODB_URI` a la dirección de tu base de datos:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/hoja_de_vida
```

Inicia la API:

```bash
npm run dev
```

La API espera a que MongoDB esté conectado antes de iniciar. Si la conexión falla, muestra el error y no inicia el servidor.

## Documentación y pruebas

- Swagger UI: <http://localhost:3000/api-docs>
- Especificación OpenAPI: <http://localhost:3000/api-docs.json>
- Comprobación de estado: `GET http://localhost:3000/api/health`
- Pruebas automatizadas (sin conexión a MongoDB): `npm test`

Swagger permite ejecutar directamente las solicitudes de la API. Para las operaciones de escritura, usa el cuerpo JSON de ejemplo en la documentación y un identificador MongoDB de 24 caracteres hexadecimales para las rutas por ID.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/experiencias` | Lista todas las experiencias, ordenadas por fecha de inicio descendente. |
| `GET` | `/api/experiencias/:id` | Consulta una experiencia por su ObjectId. |
| `POST` | `/api/experiencias` | Crea una experiencia. |
| `PUT` | `/api/experiencias/:id` | Reemplaza una experiencia existente. |
| `DELETE` | `/api/experiencias/:id` | Elimina una experiencia (respuesta `204`). |

Campos requeridos: `empresa`, `cargo`, `fechaInicio` y `descripcion`. Campos opcionales: `ubicacion`, `fechaFin`, `actual` y `tecnologias`. Las fechas deben usar el formato `AAAA-MM-DD`; la fecha de finalización no puede ser anterior a la fecha de inicio, y una experiencia marcada como actual no debe incluir `fechaFin`.

Las respuestas de datos usan el formato `{ "data": ... }`. Las solicitudes inválidas responden `400`, los registros inexistentes `404` y los errores inesperados `500`.

Las pruebas automatizadas usan un modelo simulado; no requieren credenciales de Atlas. Durante la preparación se comprobó aparte una conexión real a Atlas y el recorrido CRUD completo; se eliminó el documento temporal de prueba.

## Seguridad y publicación

El archivo `.env` contiene credenciales privadas y está excluido de Git. Configura las variables en el proveedor de alojamiento, no en el código ni en archivos versionados. En MongoDB Atlas, limita el acceso de red a las IP necesarias y utiliza un usuario de base de datos con los permisos mínimos necesarios.

Esta API se ejecuta como servidor Node.js. Un sitio estático publicado en Netlify no inicia por sí mismo el servidor Express; para alojarla en Netlify hay que adaptarla a Netlify Functions, o utilizar un proveedor que ejecute aplicaciones Node.js.
