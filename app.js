var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
var cfenv = require('cfenv');
var firebase = require("firebase");

//Setting Up Cloudant Credentials
var Cloudant = require('@cloudant/cloudant');
var me = '1f4f3453-d758-4393-a422-2010efd3d530-bluemix'; // Set this to your own account
var password = '28a1e839547250fe22c3e85e46c9f6200a26428ccd6fa95ade3778162b939779';
var cloudant = Cloudant({account:me, password:password});
cloudant.db.list(function(err, allDbs) {
  console.log('All my databases: %s', allDbs.join(', '))
});
////////////////////////////////////////////////////////////////////////////////////////////////////
var routes = require('./routes/index');
var users = require('./routes/users');

// Init App
var app = express();
app.use(fileUpload());

// View Engine
app.set('views', path.join(__dirname, 'views'));
//app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'pug')
//app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/pdfs')));

console.log("The current path is "+__dirname)

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});


//Setting up routes
app.use('/', routes);
app.use('/users', users);

// Set Port
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
