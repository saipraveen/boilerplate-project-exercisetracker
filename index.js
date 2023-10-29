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
  User.find({})
    .then(data => {
      res.send(data);
    })
    .catch(err => console.error(err));
});

const validateUser = (req, res, next) => {
  const { _id } = req.params;
  User.findById(_id)
  .then(data => {
    res.locals.userData = data;
    next();
  })
  .catch(err => console.error(err));
}
const validateDate = (date) => {
  let dateVal = new Date(date);
  if(isNaN(dateVal))
    return false;
  return true;
}
const validateDateQueryParams = (from, to) => {
  if(!(from) || !(to))
    return false;

  if(!validateDate(from))
    return false;
  
  if(!validateDate(to))
    return false;

  return true;
}
const formatLogEntries = (exerciseData) => {
  let logArray = [];
  let logCount = 0;
  for(let i in exerciseData) {
    logCount++;
    logArray.push({
      "description": exerciseData[i].description,
      "duration": exerciseData[i].duration,
      "date": new Date(exerciseData[i].logDate).toDateString()
    });
  }
  return { logCount, logArray };
}
app.get("/api/users/:_id/logs", validateUser, (req, res) => {
  console.log(req.get('host'), req.url)
  const { _id, username } = res.locals.userData;
  let { from, to, limit } = req.query;

  let query = (validateDateQueryParams(from, to)) ?
    Exercise.find({
      userId: _id,
      logDate: {
        $gte: new Date(from),
        $lt: new Date(to)
      }
    }) :
    Exercise.find({userId: _id});

  if(/^[0-9]+$/.test(limit))
    query.limit(Number(limit));
    
  return query    
    .exec()
    .then(exerciseData => {
      console.log('-- here --');
      const { logCount, logArray } = formatLogEntries(exerciseData);
      console.log(logCount, logArray);
      return res.json({
        "_id": _id,
        "username": username,
        "count": logCount,
        "log": logArray
      });
    })
    .catch(err => console.error(err));
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
