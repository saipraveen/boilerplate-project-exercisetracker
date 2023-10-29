require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = mongoose.Schema({
  username: { type: String, required: true }
});
const exerciseSchema = mongoose.Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  logDate: { type: Date, required: true }  
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

exports.UserModel = User;
exports.ExerciseModel = Exercise;