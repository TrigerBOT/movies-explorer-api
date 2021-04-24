
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {

  if (!req.headers.authorization.startsWith('Bearer ')) {

    return res.status(401).send({ message: ' Необходима авторизация' });
  }
  const token = req.headers.authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'PRODUCTION' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    console.log('ver');
    return res.status(401).send({ message: 'Необходима авторизация' });
  }

  req.user = payload;

  return next();
};