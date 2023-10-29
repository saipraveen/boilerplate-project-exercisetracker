const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const User = require('./models.js').UserModel
const Exercise = require('./models.js').ExerciseModel

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users", (req, res) => {
  let { username } = req.body;
  const user = new User({username: username});
  user.save()
    .then(data => res.json({
        "username": data.username,
        "_id": data._id
      }))
    .catch(err => console.error(err));
});

app.post("/api/users/:_id/exercises", (req, res) => {
  let { _id } = req.params;
  let { description, duration, date } = req.body;
  let dataToStore = (date) ? new Date(date) : new Date();
  if(isNaN(dataToStore))
    dataToStore = new Date();

  const exercise = new Exercise({
    userId: _id,
    description: description,
    duration: duration,
    logDate: dataToStore
  });
  exercise.save()
    .then(exerciseData => {
      User.findById(_id)
        .then(userData => {
          res.json({
            "_id": userData._id,
            "username": userData.username,
            "date": new Date(exerciseData.logDate).toDateString(),
            "duration": exerciseData.duration,
            "description": exerciseData.description
          });
        });
    })
    .catch(err => console.error(err));
});

app.get("/api/users", (req, res) => {

});

app.get("/api/users/:_id/logs", (req, res) => {
  let { from, to, limit } = req.query;

});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
