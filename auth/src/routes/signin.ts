import 'express-async-errors';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import express, { Request, Response, NextFunction } from 'express';
import { validateRequest, BadRequestError } from '@rs-ticketing/common';

import { User } from '../models/user';
import { Password } from '../utils/password';

const router = express.Router();

const validator = [
  body('email').trim().isEmail().withMessage('Email must be valid !!'),
  body('password').trim().notEmpty().withMessage('Password must be present !!'),
];

router.post(
  '/signin',
  validator,
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) throw new BadRequestError('Invalid Credentials !!');
    const passwordMatched = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordMatched) throw new BadRequestError('Invalid Credentials !!');

    // Generating JWT
    const userJWT = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );

    // setting cookie with jwt
    req.session = {
      jwt: userJWT,
    };

    res.status(200).send(existingUser);
  }
);

export { router as signInRouter };
