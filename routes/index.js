var express = require('express');
var router = express.Router();

// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
	console.log("The username here is "+req.user)

	res.render('index',
  { userID : req.user }
  )
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){

		return next();
	} else {
		console.log("Yea we are redirecting man")
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

router.get('/profile', ensureAuthenticated, function(req, res){

	res.render('profile')
});

module.exports = router;
