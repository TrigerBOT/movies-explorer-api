const User = require("../models/user");
const jwtd = require("jsonwebtoken");
const NotFoundError = require("../errors/not-found-err");
const BadRequestError = require("../errors/bad-request");
const UnauthorizedError = require("../errors/unauthorized");
const ForbiddenError = require("../errors/forbidden");
const ConflictError = require("../errors/conflict-err");
const bcrypt = require("bcryptjs");
const { NODE_ENV, JWT_SECRET } = process.env;
// GET /users/me
const getMe = (req, res, next) => {
  return User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError("Нет пользователя с таким id");
      }
      console.log({ data: user });
      return res.status(200).send({ data: user });
    })
    .catch(next);
};


// POST /signup
const createUser = (req, res, next) => {
  const { name, about, avatar, email, password } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      })
    )
    .then((user) => res.status(200).send({ email: user.email }))
    .catch((err) => {
      if (err.name === "ValidationError" || err.name === "CastError") {
        throw new BadRequestError("Данные не прошли валидацию");
      }
      if (err.name === "MongoError" || err.code === "11000") {
        throw new ConflictError("Такой емейл уже зарегистрирован");
      }
    })
    .catch(next);
};

// PATCH /users/me

const patchUser = (req, res, next) => {
  const owner = req.user._id;

  return User.findOneAndUpdate(
    owner,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError("Нет пользователя с таким id");
      }
      console.log('obnnovili')
      res.status(200).send(user);
    })
    .catch(next);
};
// POST /signin
const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
  .then((user) => {
    if(!user){

    }


    const jwt = jwtd.sign(
      { _id: user._id },
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
      { expiresIn: '7d' },
    );
    res.send({jwt});
    })
    .catch(next);
};

module.exports = {

 createUser,
  login,
  getMe,
  patchUser,

};
