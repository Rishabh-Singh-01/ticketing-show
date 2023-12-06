import request from 'supertest';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';

import { app } from '../app';
import mongoose from 'mongoose';

const signupHelper = () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const emailName = randomBytes(5).toString('hex');
  const payload = {
    id,
    email: `${emailName}@test.com`,
  };

  const jwtToken = jwt.sign(payload, process.env.JWT_KEY!);

  const jwtTokenObj = {
    jwt: jwtToken,
  };

  const jwtTokenObjJson = JSON.stringify(jwtTokenObj);

  const base64 = Buffer.from(jwtTokenObjJson).toString('base64');

  return `session=${base64}`;
};
/**
 * macks a cookie after signup with valid test email and password
 */
const getSignUpCookie = () => {
  // due to supertest expecting cookies in array form
  return [signupHelper()];
};

export { getSignUpCookie };
