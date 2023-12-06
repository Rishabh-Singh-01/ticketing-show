import mongoose from 'mongoose';

const generateId = () => {
  return new mongoose.Types.ObjectId().toHexString();
};

export { generateId };
