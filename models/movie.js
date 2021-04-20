const mongoose = require("mongoose");
const { invalidURL, urlRegExp } = require("../utils/constants");

const movieSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },

  director: {
    type: String,
    required: true,
  },

  duration: {
    type: Number,
    required: true,
  },

  year: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  image: {
    type: Object,
    required: true,
    url: { type: String, required: false },
  },

  trailer: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return urlRegExp.test(v);
      },
      message: invalidURL,
    },
  },
  movieId: {
    type: Number,
    required: true,
  },
  // Нужно задать поведение по умолчанию, чтобы база данных не возвращала это поле.
  owner: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "user",
    required: true,
    selected: false,
  },

  nameRU: {
    type: String,
    required: true,
  },

  nameEN: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("movie", movieSchema);
