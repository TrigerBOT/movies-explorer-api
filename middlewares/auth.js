const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized');

const { NODE_ENV, JWT_SECRET } = process.env;
const { loginError } = require('../utils/constants');

module.exports = (req, res, next) => {
  if (!req.headers.authorization) {
    throw new UnauthorizedError(loginError);
  }
  if (!req.headers.authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError(loginError);
  }
  const token = req.headers.authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    throw new UnauthorizedError(loginError);
  }

  req.user = payload;

  return next();
};
