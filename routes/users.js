var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
var User = require('../models/user');
const uuidv1 = require('uuid/v1');


// Register
router.get('/register', function(req, res){
	if(req.isAuthenticated()){
		//Get username info
		res.redirect('/index')
	}
	else{
		res.render('register')
	}

});

// Login
router.get('/login', function(req, res){
	if(req.isAuthenticated()){
		//Get username info
		res.redirect('/index')
	}
	else{
		res.render('login')
	}

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
	if(upassword != upassword2){
		console.log("not sure wtf this is")
		res.render('register',
		{ pNotMatch : true }
		)
	}
	else{
		var Cloudant = require('@cloudant/cloudant');
		var me = '1f4f3453-d758-4393-a422-2010efd3d530-bluemix'; // Set this to your own account
		var cpassword = '28a1e839547250fe22c3e85e46c9f6200a26428ccd6fa95ade3778162b939779';
		var cloudant = Cloudant({account:me, password:cpassword});
		cloudant.db.list(function(err, allDbs) {
		  console.log('All my databases: %s', allDbs.join(', '))
		});


		 var newUser = {
	  	"name": name,
	  	"email": email,
			"username": username,
			"password": upassword,
			"book_ids" : "",
			"rating": 0,
			"numberOfRatings" : 0,
			"book_count" : 0
		  }
			console.log("Now creating the user")

		 User.createUser(newUser, function(err, user){
			 if(err) throw err;
			 console.log("ESKITTIT"+newUser);
		 })

		 req.flash('success_msg', 'You are registered and can now login');
		 res.redirect('/users/login')
	}

});

//User.getUserByUsername("asd", function(err, user){
//	if(err) throw err
//	console.log("And the user is: "+JSON.stringify(user))
//})

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
				console.log("It is a match and the user id is id"+user._id)
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
	console.log("And now onto serializeUser we have id of: "+user._id)
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
		console.log("Getting user by id: "+user)
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
		req.flash('userinfo',req.user.username);

    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});


module.exports = router;
