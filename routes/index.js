var express = require('express');
var router = express.Router();
console.log("It is authenticated")
// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
	console.log("It is authenticated HOW THOS")
	res.render('index');
});

function ensureAuthenticated(req, res, next){
	console.log("It is authenticated HOW THOS")
	if(req.isAuthenticated()){
		return next();
		console.log("It is authenticated HOW THOS")

	} else {
		//req.flash('error_msg','You are not logged in');
		console.log("It EY")
		res.redirect('/users/login');
	}
}

module.exports = router;
