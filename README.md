# Hoja de vida y API de experiencias profesionales

Proyecto académico de una hoja de vida web y una API REST para administrar experiencias profesionales. La API está desarrollada con Node.js, Express y MongoDB.

## Contenido del proyecto

- Sitio web estático de hoja de vida en HTML, CSS, Bootstrap, JavaScript y jQuery.
- API REST independiente en [`api-experiencias/`](./api-experiencias/).
- Modelo MongoDB/Mongoose para registrar experiencias profesionales.
- Documentación interactiva Swagger y especificación OpenAPI.
- Pruebas automatizadas de los endpoints y las validaciones.

## Mejoras implementadas

- CRUD completo: crear, listar, consultar, reemplazar y eliminar experiencias profesionales.
- Validación de campos requeridos, tipos, fechas en formato `AAAA-MM-DD`, rango de fechas, tecnologías y campos desconocidos.
- Manejo explícito de errores: `400` para solicitudes inválidas, `404` para experiencias inexistentes y `500` para errores inesperados.
- Respuestas JSON consistentes, marcas de tiempo automáticas y orden cronológico descendente en el listado.
- Inicio del servidor únicamente después de conectar con MongoDB; los problemas de conexión se informan en la consola.
- Documentación OpenAPI 3.0.3 disponible desde Swagger UI para explorar y ejecutar solicitudes.
- Configuración por variables de entorno. El archivo `.env` está excluido del control de versiones para proteger las credenciales.
- Pruebas automatizadas sin necesidad de conectarse a una base de datos real.

## Requisitos

- Node.js 20.19 o superior.
- MongoDB local o una instancia de MongoDB Atlas.

## Ejecutar la API

Abre una terminal en la carpeta `api-experiencias`:

```powershell
cd api-experiencias
npm install
Copy-Item .env.example .env
```

Edita `.env` y configura el puerto y la URI privada de MongoDB:

```env
PORT=3000
MONGODB_URI=mongodb+srv://USUARIO:CONTRASENA@CLUSTER/hoja_de_vida?retryWrites=true&w=majority
```

Sustituye los valores de ejemplo por los datos de tu clúster de Atlas. Si la contraseña contiene caracteres especiales, codifícala para una URI. En Atlas, permite únicamente las IP desde las que la API necesita conectarse. **No publiques ni compartas `.env` o la URI.**

Inicia el servidor de desarrollo:

```powershell
npm run dev
```

Para iniciar el servidor sin modo de observación:

```powershell
npm start
```

La conexión a MongoDB debe establecerse antes de que el servidor empiece a aceptar solicitudes. Si no se configura `MONGODB_URI` o Atlas rechaza la conexión, revisa la configuración local y los mensajes de la terminal.

## Probar la API

- Swagger UI: <http://localhost:3000/api-docs>
- Especificación OpenAPI: <http://localhost:3000/api-docs.json>
- Estado del servidor: <http://localhost:3000/api/health>

Swagger UI permite ejecutar cada endpoint desde el navegador: abre una operación, pulsa **Try it out**, proporciona el cuerpo o identificador solicitado y selecciona **Execute**.

| Método | Ruta | Resultado |
|---|---|---|
| `GET` | `/api/experiencias` | Lista experiencias ordenadas por fecha de inicio descendente. |
| `GET` | `/api/experiencias/:id` | Consulta una experiencia por su ObjectId de MongoDB. |
| `POST` | `/api/experiencias` | Crea una experiencia y responde `201`. |
| `PUT` | `/api/experiencias/:id` | Reemplaza una experiencia existente. |
| `DELETE` | `/api/experiencias/:id` | Elimina una experiencia y responde `204`. |

Ejemplo de cuerpo JSON para crear una experiencia:

```json
{
  "empresa": "Empresa de ejemplo",
  "cargo": "Desarrollador de software",
  "ubicacion": "Bogotá, Colombia",
  "fechaInicio": "2023-01-15",
  "fechaFin": "2024-06-30",
  "actual": false,
  "descripcion": "Desarrollo y mantenimiento de aplicaciones web.",
  "tecnologias": ["Node.js", "Express", "MongoDB"]
}
```

Campos obligatorios: `empresa`, `cargo`, `fechaInicio` y `descripcion`. Campos opcionales: `ubicacion`, `fechaFin`, `actual` y `tecnologias`. Las fechas deben ser válidas y usar `AAAA-MM-DD`. `fechaFin` no puede preceder a `fechaInicio`; una experiencia actual no debe incluir fecha de finalización.

La base `hoja_de_vida` y su colección se crean en MongoDB al guardar el primer documento. No hace falta añadir experiencias ficticias: usa información real o elimina los registros de prueba cuando termines.

## Pruebas automatizadas

Desde `api-experiencias`:

```powershell
npm test
```

Las pruebas comprueban los endpoints HTTP, validaciones, errores, modelo y documentación Swagger mediante un modelo MongoDB simulado; no requieren que Atlas esté disponible. La conexión real a Atlas y un recorrido CRUD se comprobaron aparte durante el desarrollo, eliminando el registro temporal de prueba.

## Publicación

El sitio HTML se puede publicar como contenido estático. La API, en cambio, es un servidor Node.js que necesita ejecutarse en un servicio compatible con Node.js y conectarse a MongoDB; publicar los archivos estáticos en Netlify no inicia por sí solo `api-experiencias`. Para alojar también la API en Netlify hay que adaptarla a Netlify Functions o desplegar el servidor en otro proveedor compatible.

Antes de subir el proyecto a GitHub, confirma que `.env` no esté incluido. El archivo `.gitignore` de la API excluye `.env` y `node_modules`.
