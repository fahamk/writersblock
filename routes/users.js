var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
var User = require('../models/user');

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

// Register User
router.post('/register', function(req, res){
	var name = req.body.name;
	console.log("THE NAME IS")
	console.log(name)
	var email = req.body.email;
	var username = req.body.username;
	var upassword = req.body.password;
	var upassword2 = req.body.password2;
	var Cloudant = require('@cloudant/cloudant');
	var me = '1f4f3453-d758-4393-a422-2010efd3d530-bluemix'; // Set this to your own account
	var password = '28a1e839547250fe22c3e85e46c9f6200a26428ccd6fa95ade3778162b939779';
	var cloudant = Cloudant({account:me, password:password});
	cloudant.db.list(function(err, allDbs) {
	  console.log('All my databases: %s', allDbs.join(', '))
	});


	var hash = crypto.createHash('md5').update(upassword).digest('hex');
	console.log(hash); // 9b74c9897bac770ffc029102a200c5de

	 var user = {
  	"name": name,
  	"email": email,
		"username": username,
		"password": upassword,
		"book_ids" : "",
		"rating": 0,
		"book_count" : 0
	  }
   var jsonString= JSON.stringify(user);
	 console.log(jsonString)

	 Cloudant({account:me, password:password}, function(er, cloudant) {
	   if (er)
	     return console.log('Error connecting to Cloudant account %s: %s', me, er.message)

	         // specify the database we are going to use
	       var users = cloudant.db.use('users')
	       // and insert a document in it
	       users.insert(user, function(err, body, header) {
	         if (err)
	           return console.log('[users.insert] ', err.message)

	         console.log('you have inserted the user info.')
	         console.log(body)
	       })


	 })


});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

module.exports = router;
