import jwt from 'jsonwebtoken';
import 'express-async-errors';
import { body } from 'express-validator';
import express, { Request, Response } from 'express';
import { validateRequest, BadRequestError } from '@rs-ticketing/common';

import { User } from '../models/user';

const router = express.Router();

const validator = [
  body('email').trim().isEmail().withMessage('Email must be valid.'),
  body('password')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Password must be between 4 and 20'),
];

router.post(
  '/signup',
  validator,
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    // Checking if the user already exists or not
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new BadRequestError('Email already in use !!');

    // save the user in the db
    const user = User.build({
      email,
      password,
    });
    await user.save();

    // Generating JWT
    const userJWT = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );

    // setting cookie with jwt
    req.session = {
      jwt: userJWT,
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
