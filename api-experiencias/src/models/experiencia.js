const mongoose = require('mongoose');

const experienciaSchema = new mongoose.Schema(
  {
    empresa: {
      type: String,
      required: [true, 'La empresa es obligatoria.'],
      trim: true,
      maxlength: [120, 'La empresa no puede superar 120 caracteres.'],
    },
    cargo: {
      type: String,
      required: [true, 'El cargo es obligatorio.'],
      trim: true,
      maxlength: [120, 'El cargo no puede superar 120 caracteres.'],
    },
    ubicacion: {
      type: String,
      trim: true,
      maxlength: [120, 'La ubicación no puede superar 120 caracteres.'],
      default: '',
    },
    fechaInicio: {
      type: Date,
      required: [true, 'La fecha de inicio es obligatoria.'],
    },
    fechaFin: {
      type: Date,
      default: undefined,
      validate: {
        validator(fechaFin) {
          return !fechaFin || !this.fechaInicio || fechaFin >= this.fechaInicio;
        },
        message: 'La fecha de finalización no puede ser anterior a la fecha de inicio.',
      },
    },
    actual: {
      type: Boolean,
      default: false,
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria.'],
      trim: true,
      maxlength: [2000, 'La descripción no puede superar 2000 caracteres.'],
    },
    tecnologias: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports =
  mongoose.models.Experiencia ||
  mongoose.model('Experiencia', experienciaSchema);
