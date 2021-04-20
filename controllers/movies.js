const jwt = require("jsonwebtoken");
const NotFoundError = require("../errors/not-found-err");
const BadRequestError = require("../errors/bad-request");
const ConflictError = require("../errors/conflict-err");
const {
  idExistsError,
  searchFilmError,
  invalidMovieId,
} = require("../utils/constants");
const Movie = require("../models/movie");
// POST /movies
const createMovie = (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization.replace("Bearer ", "");
  const ownerId = jwt.decode(token);

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
      if (movie) {
        res.send(movie);
      } else {
        throw new ConflictError(idExistsError);
      }
    })
    .catch((err) => next(err));
};
// GET /movies
const getOwnMovies = (req, res, next) => {
  const owner = req.user._id;

  Movie.find({ owner })
    .then((movies) => {
      if (!movies) {
        throw new NotFoundError(searchFilmError);
      }
      res.send(movies);
    })
    .catch((err) => next(err));
};
// DELETE /movies/:movieId
const removeMovie = (req, res, next) => {
  const reqMovieId = req.params.movieId;

  Movie.find({ movieId: reqMovieId })
    .then((movie) => {
      if (movie === null) {
        throw new NotFoundError(searchFilmError);
      } else if (String(req.params.movieId) !== String(movie[0].movieId)) {
        throw new BadRequestError(invalidMovieId);
      }
      movie[0].remove().then((deleted) => {
        res.status(200).send({ deleted });
      });
    })
    .catch((err) => next(err));
};

module.exports = {
  createMovie,
  getOwnMovies,
  removeMovie,
};
