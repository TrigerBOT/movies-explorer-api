const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request');
const ConflictError = require('../errors/conflict-err');
const UnauthorizedError = require('../errors/unauthorized');
const {
  idExistsError,
  searchFilmError,
  loginError,
} = require('../utils/constants');
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
    thumbnail,
    trailer,
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
    thumbnail,
    trailer,
    movieId,
    owner: ownerId,
    nameRU,
    nameEN,
  })
    .then((movie) => {
      const newMovie = movie;
      newMovie.owner = undefined;
      res.status(201).send({ data: newMovie });
    })
    .catch((err) => {
      console.log(err.message);
      if (err.name === 'ValidationError') {
        throw new BadRequestError(err.message);
      } else if (err.name === 'MongoError' && err.code === 11000) {
        throw new ConflictError(idExistsError);
      } else next(err);
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
    .select('-owner')
    .catch(next);
};

// DELETE /movies/:movieId
const removeMovie = (req, res, next) => {
  Movie.find({ _id: req.params.movieId }).select('+owner')
    .then((movie) => {
      if (!movie[0]) {
        throw new NotFoundError(searchFilmError);
      }
      if (movie[0].owner.toString() !== req.user._id) {
        throw new UnauthorizedError(loginError);
      } else {
        Movie.findOneAndDelete({
          _id: req.params.movieId,
        }).select('-owner')
          .then((deletedMovie) => {
            res.status(200).send({ data: deletedMovie });
          })
          .catch(next);
      }
    })
    .catch(next);
};
module.exports = {
  createMovie,
  getOwnMovies,
  removeMovie,
};
