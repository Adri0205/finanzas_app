const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

  monto: {
    type: Number,
    required: true
  },

  tipo: {
    type: String,
    enum: ['ingreso', 'gasto'],
    required: true
  },

  categoria: {
    type: String,
    required: true
  },

  cuenta: {
    type: String,
    required: true
  },

  fecha: {
    type: Date,
    default: Date.now
  },

  descripcion: {
    type: String
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  'Transaction',
  transactionSchema
);