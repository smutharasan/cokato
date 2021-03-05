//#region ********* HEADER********************
//  * Name: Supriya Mutharasan
//  * Course: WEB322
//  * Professor: Dr.Sharmin Ahmed
//  * Date: 12/10/2020
//#endregion

//#region setup our modules
const HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const app = express();

const server = require('http').Server(app);
// const server = app.listen(HTTP_PORT);
const io = require('socket.io')(server);

const amazonScraper = require('amazon-buddy');
const kijiji = require('kijiji-scraper');

const path = require('path');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const _ = require('underscore');
const fs = require('fs');
const moment = require('moment');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'),
  SALT_WORK_FACTOR = 10;
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const clientSessions = require('client-sessions');
const { v4: uuidV4 } = require('uuid');
const UserModel = require('./static/src/UserModel');
const config = require('./static/src/config.js');
const connectionString = config.atlas_database_connection_string;

// some kind of user directory
//#endregion

//#region set middleware
app.use(express.static('static'));
app.use(express.static('node_modules'));

// Setup client-sessions
app.use(
  clientSessions({
    cookieName: 'session', // this is the object name that will be added to 'req'
    secret: 'seneca_hackathon_cokato_social_media_app', // this should be a long un-guessable string.
    duration: 20 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

var urlenParser = bodyParser.urlencoded({
  extended: true,
});

// connect to your mongoDB database
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// log when the DB is connected
mongoose.connection.on('open', () => {
  console.log('Database connection open.');
});

//#region // Server side validation
function serverSideSignUpFormValidate(givenUserObj) {
  /*Minimum ten characters, at least one uppercase letter, one lowercase letter, one number and one special character: */
  const passwordExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  var validationFlag = true;

  var signUpFormFirstName = givenUserObj.signUpFormFirstName;
  var signUpFormLastName = givenUserObj.signUpFormLastName;
  var signUpFormUsername = givenUserObj.signUpFormUsername;
  var signUpFormEmail = givenUserObj.signUpFormEmail;
  var signUpFormPassword = givenUserObj.signUpFormPassword;

  if (signUpFormFirstName === '') validationFlag = false;

  if (signUpFormLastName === '') validationFlag = false;

  if (signUpFormUsername === '') validationFlag = false;

  if (signUpFormEmail === '') validationFlag = false;

  if (!signUpFormPassword.match(passwordExp)) validationFlag = false;

  return validationFlag;
}

function serverSideSignInFormValidate(givenUserObj) {
  const passwordExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  var validationFlag = true;

  var signInFormUsername = givenUserObj.signInFormUsername;
  var signInFormPassword = givenUserObj.signInFormPassword;

  if (signInFormUsername === '') validationFlag = false;

  if (!signInFormPassword.match(passwordExp)) validationFlag = false;

  return validationFlag;
}

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/home#modalLoginForm');
  } else {
    next();
  }
}

function ensureAdminLogin(req, res, next) {
  if (!req.session.user.isAdmin) {
    res.redirect('/home#modalLoginForm');
  } else {
    next();
  }
}

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log('Express http server listening on: ' + HTTP_PORT);
}
//#endregion

//#endregion

//#region Register handlerbars as the rendering engine for views
app.set('views', './views');
app.set('layout', './views/layout');
app.engine(
  '.hbs',
  exphbs({
    extname: '.hbs',
    json: function (context) {
      return JSON.stringify(context);
    },
  })
);

app.set('view engine', '.hbs');
//#endregion

//#region Setting up routes that use GET Method
app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/home', (req, res) => {
  res.render('viewHome', {
    registeredUser: req.session.user,
    errorsPresent: req.session.err,
    layout: 'home', // do not use the default Layout (main.hbs)
  });
});

app.get('/contactUs', (req, res) => {
  res.render('viewContactUs', {
    registeredUser: req.session.user,
    errorsPresent: req.session.err,
    layout: 'homeBasic', // do not use the default Layout (main.hbs)
  });
});
app.get('/about', (req, res) => {
  res.render('viewAbout', {
    registeredUser: req.session.user,
    errorsPresent: req.session.err,
    layout: 'home', // do not use the default Layout (main.hbs)
  });
});

app.get('/shop', (req, res) => {
  amazonScraper
    .products({
      keyword: 'medical supplies & equipment',
      number: 1,
      country: 'CA',
    })
    .then((prods) => {
      let results = prods.result.slice(0, 10);
      res.render('viewShop', {
        registeredUser: req.session.user,
        errorsPresent: req.session.err,
        retrievedProducts: results,
        layout: 'homeBasic', // do not use the default Layout (main.hbs)
      });
    })
    .catch(console.error);
});
app.get('/news', (req, res) => {
  const xhttp = new XMLHttpRequest();
  //http://newsapi.org/v2/top-headlines?country=ca&category=health&apiKey=a53b6bfe3090434d97c0069edda96c77

  xhttp.open(
    'GET',
    'http://newsapi.org/v2/top-headlines?country=ca&category=health&apiKey=a53b6bfe3090434d97c0069edda96c77',
    false
  );
  xhttp.send();

  const news = JSON.parse(xhttp.responseText);

  res.render('viewNews', {
    registeredUser: req.session.user,
    errorsPresent: req.session.err,
    givenNewsOfTheDay: news.articles.slice(0, 10),
    layout: 'homeBasic', // do not use the default Layout (main.hbs)
  });
});

app.get('/dashboard', ensureLogin, (req, res) => {
  if (!req.session.user.isAdmin) {
    UserModel.findOne({
      user_name_user: req.session.user.username,
    })
      .lean()
      .exec()
      .then((result) => {
        res.render('viewDashboard', {
          registeredUser: req.session.user,
          errorsPresent: req.session.err,
          layout: 'homeBasic', // do not use the default Layout (main.hbs)
        });
      })
      .catch((err) => {
        console.error(err);
      });
  } else res.redirect('/adminDashboard');
});

app.get('/adminDashboard', ensureLogin, ensureAdminLogin, (req, res) => {
  res.render('viewAdminDashboard', {
    registeredUser: req.session.user,
    errorsPresent: req.session.err,
    layout: 'home', // do not use the default Layout (main.hbs)
  });
});

app.get('/requestRoom', ensureLogin, (req, res) => {
  res.redirect(`/room/${uuidV4()}`);
});
app.get('/room/:roomID', ensureLogin, (req, res) => {
  const givenRoomID = req.params.roomID;
  res.render('viewRoom', {
    registeredUser: req.session.user,
    registeredUserScript: JSON.stringify(req.session.user),
    errorsPresent: req.session.err,
    roomID: givenRoomID,
    layout: 'homeBasic', // do not use the default Layout (main.hbs)
  });
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomID, userID) => {
    socket.join(roomID);
    socket.to(roomID).broadcast.emit('user-connected', userID);

    socket.on('disconnect', () => {
      socket.to(roomID).broadcast.emit('user-disconnected', userID);
    });
  });
});

app.get('/logout', (req, res) => {
  //registeredUser.validState = false;
  req.session.reset();
  res.redirect('/home');
});

//#endregion

//#region Post routes
app.post('/register-user', urlenParser, (req, res) => {
  const formData = req.body;

  if (!serverSideSignUpFormValidate(formData)) {
    req.session.err = {
      errorMsg: 'Incorrect Username or Password',
      errorStatus: true,
    };
    return res.redirect('/home#modalRegisterForm');
  }

  bcrypt
    .hash(formData.signUpFormPassword, SALT_WORK_FACTOR)
    .then((hash) => {
      const registeredUserData = new UserModel({
        user_name_user: formData.signUpFormUsername,
        user_name_fist: formData.signUpFormFirstName,
        user_name_last: formData.signUpFormLastName,
        email: formData.signUpFormEmail,
        user_password: hash,
      });

      registeredUserData
        .save()
        .then((response) => {
          req.session.user = {
            username: registeredUserData.user_name_user,
            email: registeredUserData.email,
            validState: true,
            firstName: registeredUserData.user_name_fist,
            lastName: registeredUserData.user_name_last,
            isAdmin: registeredUserData.isAdmin,
          };
          res.redirect('/dashboard');
        })
        .catch((err) => {
          console.log('There was an error registering the user');
          console.error(err);
          req.session.err = {
            errorMsg: 'Username already exists!',
            errorStatus: true,
          };
          res.redirect('/home#modalRegisterForm');
        });
    })
    .catch((err) => {
      console.log('Something went wrong, Please try again!');
      req.session.err = {
        errorMsg: 'Something went wrong, Please sign in Again',
        errorStatus: true,
      };
      res.redirect('/home#modalRegisterForm');
    });
});

app.post('/login-user', urlenParser, (req, res) => {
  const formData = req.body;
  if (!serverSideSignInFormValidate(formData)) {
    req.session.err = {
      errorMsg: 'Incorrect Username or Password',
      errorStatus: true,
    };
    return res.redirect('/home#modalLoginForm');
  }

  UserModel.find({
    user_name_user: formData.signInFormUsername,
  })
    .exec()
    .then((givenUsers) => {
      if (givenUsers.length < 1) {
        console.log('User does not exist!');
        req.session.err = {
          errorMsg: 'Incoorect Username. Please try again',
          errorStatus: true,
        };
        return res.redirect('/home#modalLoginForm');
      } else {
        bcrypt
          .compare(formData.signInFormPassword, givenUsers[0].user_password)
          .then((result) => {
            if (result) {
              console.log('authentication successful');
              req.session.user = {
                username: givenUsers[0].user_name_user,
                email: givenUsers[0].email,
                validState: true,
                firstName: givenUsers[0].user_name_fist,
                lastName: givenUsers[0].user_name_last,
                isAdmin: givenUsers[0].isAdmin,
                _id: givenUsers[0]._id,
              };

              UserModel.updateOne(
                {
                  user_name_user: givenUsers[0].user_name_user,
                },
                {
                  $set: {
                    user_visit_last: new Date(),
                  },
                }
              ).exec();
              return res.redirect('/dashboard');
              // do other stuff
            } else {
              console.log("authentication failed. Password doesn't match");
              req.session.err = {
                errorMsg: 'Incorrect password',
                errorStatus: true,
              };
              return res.redirect('/home#modalLoginForm');
            }
          })
          .catch((err) => {
            console.log('Something went wrong, Please try again!');
            console.error(err);
            req.session.err = {
              errorMsg: 'Something went wrong, Please try again!',
              errorStatus: true,
            };
            res.redirect('/home#modalLoginForm');
          });
      }
    })
    .catch((err) => {
      console.log('Internal server error: ', err);
      res.status(500).json({
        error: err,
        message: 'Error logging in',
      });
    });
});

app.post('/user/:user_id/follow-user', (req, res) => {
  // finding user by id (to whom user is going to follow)
  User.findById(req.params.user_id).then((user) => {
    //check if follow reqest by user2 is already exist in user1 followers

    if (
      user.followers.filter(
        (follower) => follower.user.toString() === req.session.user._id
      ).length > 0
    ) {
      return res.status(400).json({
        alreadyFollowed: `User already followed ${req.params.user_id}`,
      });
    }

    // the requested user will push and save to followers of other user to whom request has made

    user.followers.push(req.session.user._id);
    var followedUser = user._id;
    user.save();

    // we will find current user by email you can find it by _id also

    User.findOne({ email: req.session.user.email })
      .then((givenUser) => {
        // now push the user to following of its own and save the user

        givenUser.following.push(followedUser);
        user.save().then((u) => res.json(u));
      })
      .catch((err) =>
        console.log(
          'error cant follow again you jave already followed the user'
        )
      );
  });
});

//#region Admin Setup // Only run this once and only once
app.get('/firstrunsetup', (req, res) => {
  //User that exists -> priyaArasan03121999
  //pwd -> Kingan11!!

  // user = "smutharasan"
  const adminPwd = 'SenecaHackathonCokato4!!';

  bcrypt
    .hash(adminPwd, SALT_WORK_FACTOR)
    .then((hash) => {
      const Supriya = new UserModel({
        user_name_user: 'priya03121999',
        user_password: hash,
        user_name_fist: 'Supriya',
        user_name_last: 'Mutharasan',
        email: 'smutharasan@myseneca.ca',
        isAdmin: true,
      });

      Supriya.save()
        .then((response) => {
          req.session.user = {
            username: Supriya.user_name_user,
            email: Supriya.email,
            validState: true,
            firstName: Supriya.user_name_fist,
            lastName: Supriya.user_name_last,
            isAdmin: Supriya.isAdmin,
          };
          res.redirect('/dashboard');
        })
        .catch((err) => {
          console.log('There was an error registering the user');
          req.session.err = {
            errorMsg: 'Incorrect Username or Password',
            errorStatus: true,
          };
          res.redirect('/home#modalRegisterForm');
        });
    })
    .catch((err) => {
      console.log('Something went wrong, Please try again!');
      req.session.err = {
        errorMsg: 'Something went wrong, Please sign in Again',
        errorStatus: true,
      };
      res.redirect('/home#modalRegisterForm');
    });
});
//#endregion

//app.listen(HTTP_PORT, onHttpStart);
server.listen(HTTP_PORT, onHttpStart);
