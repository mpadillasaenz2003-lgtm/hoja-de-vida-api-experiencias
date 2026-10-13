module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'API de experiencias profesionales',
    version: '1.0.0',
    description: 'CRUD de experiencias profesionales para una hoja de vida.',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Servidor local' }],
  tags: [{ name: 'Experiencias', description: 'Experiencias profesionales' }],
  paths: {
    '/api/health': {
      get: {
        summary: 'Verificar que la API está disponible',
        responses: {
          200: {
            description: 'La API está activa.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', example: 'ok' } },
                },
              },
            },
          },
        },
      },
    },
    '/api/experiencias': {
      get: {
        tags: ['Experiencias'],
        summary: 'Listar experiencias (de más reciente a más antigua)',
        responses: {
          200: {
            description: 'Lista de experiencias.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Experiencia' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Experiencias'],
        summary: 'Crear una experiencia',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NuevaExperiencia' },
              example: {
                empresa: 'Empresa de ejemplo',
                cargo: 'Desarrollador de software',
                ubicacion: 'Bogotá, Colombia',
                fechaInicio: '2023-01-15',
                fechaFin: '2024-06-30',
                actual: false,
                descripcion: 'Desarrollo y mantenimiento de aplicaciones web.',
                tecnologias: ['Node.js', 'Express', 'MongoDB'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Experiencia creada.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Experiencia' } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ErrorValidacion' },
        },
      },
    },
    '/api/experiencias/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
          description: 'Identificador ObjectId de MongoDB.',
        },
      ],
      get: {
        tags: ['Experiencias'],
        summary: 'Consultar una experiencia',
        responses: {
          200: {
            description: 'Experiencia encontrada.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Experiencia' } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ErrorSolicitud' },
          404: { $ref: '#/components/responses/NoEncontrado' },
        },
      },
      put: {
        tags: ['Experiencias'],
        summary: 'Reemplazar una experiencia',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NuevaExperiencia' },
            },
          },
        },
        responses: {
          200: {
            description: 'Experiencia actualizada.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Experiencia' } },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ErrorValidacion' },
          404: { $ref: '#/components/responses/NoEncontrado' },
        },
      },
      delete: {
        tags: ['Experiencias'],
        summary: 'Eliminar una experiencia',
        responses: {
          204: { description: 'Experiencia eliminada.' },
          400: { $ref: '#/components/responses/ErrorSolicitud' },
          404: { $ref: '#/components/responses/NoEncontrado' },
        },
      },
    },
  },
  components: {
    schemas: {
      NuevaExperiencia: {
        type: 'object',
        required: ['empresa', 'cargo', 'fechaInicio', 'descripcion'],
        additionalProperties: false,
        properties: {
          empresa: { type: 'string', maxLength: 120, example: 'Empresa de ejemplo' },
          cargo: { type: 'string', maxLength: 120, example: 'Desarrollador' },
          ubicacion: { type: 'string', maxLength: 120, example: 'Bogotá, Colombia' },
          fechaInicio: { type: 'string', format: 'date', example: '2023-01-15' },
          fechaFin: { type: 'string', format: 'date', example: '2024-06-30' },
          actual: { type: 'boolean', default: false },
          descripcion: { type: 'string', maxLength: 2000 },
          tecnologias: { type: 'array', items: { type: 'string' }, default: [] },
        },
      },
      Experiencia: {
        allOf: [
          { $ref: '#/components/schemas/NuevaExperiencia' },
          {
            type: 'object',
            required: ['_id', 'createdAt', 'updatedAt'],
            properties: {
              _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        ],
      },
      Error: {
        type: 'object',
        properties: { error: { type: 'string' } },
      },
      ErrorValidacion: {
        description: 'Datos de entrada inválidos.',
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/Error' },
                { type: 'object', properties: { detalles: { type: 'array', items: { type: 'string' } } } },
              ],
            },
          },
        },
      },
      ErrorSolicitud: {
        description: 'Identificador inválido o solicitud mal formada.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
      NoEncontrado: {
        description: 'La experiencia no existe.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    },
  },
};
