import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const options = {
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000,  // 45 seconds
      serverSelectionTimeoutMS: 5000, // 5 seconds
      heartbeatFrequencyMS: 10000,    // 10 seconds
      retryWrites: true,
      maxPoolSize: 10,
      minPoolSize: 2
    };

    await mongoose.connect(process.env.DB_URL, options);
    console.log('MongoDB Connected Successfully');

    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }
};

export { connectDB };
