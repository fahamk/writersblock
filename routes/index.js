var express = require('express');
var router = express.Router();

// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
	console.log("The username here is "+req.user)
	req.flash(req.user);
	res.render('index');
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

module.exports = router;
