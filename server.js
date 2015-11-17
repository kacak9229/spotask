/*
* Module dependecies.
*/
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var lusca = require('lusca');
var ejs = require('ejs');
var engine = require('ejs-mate');

var MongoStore = require('connect-mongo')(session); // For session handling
var mongoose = require('mongoose');
var flash = require('express-flash');
var expressValidator = require('express-validator');
var path = require('path');
var passport = require('passport');

/*
API keys and Passport configuration
*/
var secret = require('./config/secret');


/*
Create express server
*/
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


// Connect to MongoDB either use Mongolab
mongoose.connect(secret.database, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Connected to the database');
  }
});

/*
Express configuration
*/
app.use(express.static(__dirname + '/public'));
// app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secret.sessionSecret,
  store: new MongoStore({ url: secret.database, autoReconnect: true })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use(lusca({
  csrf: true,
  xframe: 'SAMEORIGIN',
  xssProtection: true
}));

/*
App Routes
*/
var main = require('./routes/main');
var userRoute = require('./routes/user');
var companyRoute = require('./routes/company');
var resumeRoute = require('./routes/resume');
var adminRoute = require('./routes/admin');

app.use(main);
app.use(userRoute);
app.use(companyRoute);
app.use(resumeRoute);
app.use(adminRoute);

http.listen(3000, function(err) {
  if (err) {
    console.log('Error running express server');
  } else {
    console.log('Running on port 3000');
  }
});
