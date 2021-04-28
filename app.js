const express = require('express');

const { PORT = 3000,DB_adress } = process.env;
const mongoose = require('mongoose');

const app = express();
require('dotenv').config();
const { errors, celebrate, Joi } = require('celebrate');
const cors = require('cors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { createUser, login } = require('./controllers/users');
const usersRout = require('./routes/usersRout');
const moviesRout = require('./routes/moviesRout');
const NotFoundError = require('./errors/not-found-err');
const auth = require('./middlewares/auth');
const options = require('./utils/constants');

mongoose.connect(`${DB_adress}`, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  autoIndex: true,
});
app.use(express.json());

app.use(cors(options));
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use(requestLogger);

// логи запросов

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),

      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    }),
  }),
  createUser,
);
app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

app.use('/users', auth, usersRout);
app.use('/movies', auth, moviesRout);
app.use('*', auth, () => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});
app.use(errorLogger);
app.use(errors());
app.use((req, res, err) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
  });
});
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
