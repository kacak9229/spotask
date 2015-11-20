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
var passportSocketIo = require('passport.socketio');

function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');
  accept(); //Let the user through
}

function onAuthorizeFail(data, message, error, accept){
  if(error) accept(new Error(message));
  console.log('failed connection to socket.io:', message);
  accept(null, false);
}

/*
API keys and Passport configuration
*/
var User = require('./models/user');
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

var sessionStore = new MongoStore({ url: secret.database, autoReconnect: true })
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
  store: sessionStore
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

io.on('connection', function(socket){
  socket.on('notify', function(msg){

      User.findById({ _id: msg.userId}, function(err, found) {
        if (typeof found === 'undefined') {
          // Do something but what should I do?s
        } else {
          found.notifications.push(msg.notification);
          found.save(function(err) {
            if (err) throw err;
            console.log(msg.count);
            io.emit('notify', {notification: msg.notification});
          });
        }
      });
  });
});

app.use(main);
app.use(userRoute);
app.use(companyRoute);
app.use(resumeRoute);
app.use(adminRoute);

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on', http.address().port);
});
