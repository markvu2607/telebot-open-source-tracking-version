
import mongoose from 'mongoose';

const followingSchema = new mongoose.Schema({
  username: String,
  packageName: String
});

export const Following = mongoose.model('Following', followingSchema);