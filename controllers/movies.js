const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request');
const ConflictError = require('../errors/conflict-err');
const { idExistsError, searchFilmError } = require('../utils/constants');
const Movie = require('../models/movie');
// POST /movies
const createMovie = (req, res, next) => {
  const ownerId = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer: trailerLink,
    movieId,
    owner: ownerId,
    nameRU,
    nameEN,
  })
    .then((movie) => {
      res.status(201).send({ data: movie });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(err.message);
      } else if (err.code === 11000) {
        throw new ConflictError(idExistsError);
      }
    })
    .catch(next);
};

// GET /movies
const getOwnMovies = (req, res, next) => {
  const owner = req.user._id;

  Movie.find({ owner })
    .then((movies) => {
      res.status(200).send(movies);
    })
    .catch(() => {
      throw new NotFoundError(searchFilmError);
    })
    .catch(next);
};

// DELETE /movies/:movieId
const removeMovie = (req, res, next) => {
  Movie.findOneAndDelete({
    _id: req.params.movieId,
    owner: req.user._id,
  })
    .then((deletedMovie) => {
      if (!deletedMovie) {
        throw new NotFoundError(searchFilmError);
      }
      res.status(200).send({ data: deletedMovie });
    })
    .catch(next);
};

module.exports = {
  createMovie,
  getOwnMovies,
  removeMovie,
};
