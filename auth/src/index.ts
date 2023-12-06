import mongoose from 'mongoose';
import { app } from './app';
const start = async () => {
  if (!process.env.JWT_KEY)
    throw new Error('JWT KEY env variable not found !!');
  try {
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Unable to connect to MongoDB');
    console.error(err);
  }
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Auth Server listening on port ${PORT} !!`);
  });
};
start();
