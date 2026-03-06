import mongoose from 'mongoose';

const getMongoURI = (): string => {
  const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
  const DB_NAME = process.env.DB_NAME || 'learning-web';
  return `${MONGODB_URL}/${DB_NAME}`;
};

const mongooseOptions = {
  autoIndex: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

export const connectDatabase = async (): Promise<void> => {
  try {
    const uri = getMongoURI();
    await mongoose.connect(uri, mongooseOptions);
    console.log('✓ MongoDB connected successfully');
    console.log(`✓ Database URL: ${process.env.MONGODB_URL || 'localhost'}`);
    console.log(`✓ Database Name: ${mongoose.connection.db.databaseName}`);
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠ MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('✗ MongoDB error:', error);
});

export default mongoose;
