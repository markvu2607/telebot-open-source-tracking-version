import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return mongoose.connection;
  }

  const options = {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    maxPoolSize: 10,
    minPoolSize: 2
  };

  return mongoose.connect(process.env.DB_URL, options);
};

export { connectDB };
