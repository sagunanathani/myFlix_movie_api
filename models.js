//Mongoose schemas and models in model.js file
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

// Mongoose schema: keys = field names, values = data types
// Movie Schema
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String,
  },
  Director: {
    Name: String,
    BirthYear: Number,
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean,
  ReleaseYear: Number,
  Rating: Number,
});

// User Schema
let userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'] },
  birthday: { type: Date, default: null },
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

// 🔐 Hash password before saving user
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

// Compare hashed passwords on login
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

// Creates "movies" and "users" collections in MongoDB (stored in /data/db)
// Create models
let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

// Export models to use in other files like index.js
module.exports.Movie = Movie;
module.exports.User = User;
