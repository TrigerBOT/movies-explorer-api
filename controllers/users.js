const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request');
const { userExistsError } = require('../utils/constants');
const ConflictError = require('../errors/conflict-err');

const { NODE_ENV, JWT_SECRET } = process.env;

// GET /users/me
const getMe = (req, res, next) => User.findById(req.user._id)
  .then((user) => {
    if (!user) {
      throw new NotFoundError('Нет пользователя с таким id');
    }
    console.log({ data: user });
    return res.status(200).send({ data: user });
  })
  .catch(next);

// POST /signup
const createUser = (req, res, next) => {
  const { name, email, password } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => {
      res.status(200).send({ email: user.email });
    })
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new BadRequestError('Данные не прошли валидацию');
      }
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new ConflictError(userExistsError);
      } else {
        next(err);
      }
    })
    .catch(next);
};

// PATCH /users/me

const patchUser = (req, res, next) => {
  const owner = req.user._id;
  const newName = req.body.name;
  const newEmail = req.body.email;
  User.findOne({ newEmail }).then((user) => {
    if (user) {
      throw new ConflictError(userExistsError);
    }
    User.findOneAndUpdate(
      { _id: owner },
      { name: newName, email: newEmail },
      { runValidators: true, new: true },
    )
      .orFail(() => {
        throw new NotFoundError('Нет пользователя с таким id');
      })
      .then((userData) => {
        res.status(200).send(userData);
      })
      .catch((err) => {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
          throw new BadRequestError('Данные не прошли валидацию');
        }
        if (err.name === 'MongoError' && err.code === 11000) {
          throw new ConflictError(userExistsError);
        } else next(err);
      })
      .catch(next);
  })
    .catch(next);
};

// POST /signin
const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );

      res.send({ token });
    })
    .catch(next);
};
module.exports = {
  createUser,
  login,
  getMe,
  patchUser,
};
