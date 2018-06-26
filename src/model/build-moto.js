'use strict';

import mongoose from 'mongoose';

const motorcycleSchema = mongoose.Schema({
  user: {
    type: String,
    required: true,
    unique: true,
  },
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
  },
  description: {
    type: String,
    maxLength: 147,
  },
  createdOn: {
    type: Date,
    default: () => new Date(),
  },
});

const skipInit = process.env.NODE_ENV === 'development';
export default mongoose.model('motorcycles', motorcycleSchema, 'motorcycles', skipInit);
