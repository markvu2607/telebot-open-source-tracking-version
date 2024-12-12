import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: String,
  version: String,
  description: String
});

export const Package = mongoose.model('Package', packageSchema);
