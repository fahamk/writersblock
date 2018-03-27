var express = require('express');
var router = express.Router();
var User = require('../models/user');
const fileUpload = require('express-fileupload');
var AWS = require('ibm-cos-sdk');
var util = require('util');
var fs = require('fs')

var config = {
    endpoint: 's3-api.dal-us-geo.objectstorage.softlayer.net',
    apiKeyId: 't4YOTrcghfoTuvquMx1Bkg2uchGEC9pJ6mxQb8LisCO5',
    ibmAuthEndpoint: 'https://iam.ng.bluemix.net/oidc/token',
    serviceInstanceId: 'crn:v1:bluemix:public:cloud-object-storage:global:a/104bbcddeeca5a683ecec702a10d3c05:f2114b17-7a1d-42f0-a4b1-bcf5b0840bae::',
};

var cos = new AWS.S3(config);


// Get Homepage
router.get('/', function(req, res){
	console.log("The username here is "+req.user)
  var isLoggedIn = false
	var menuBar;
	if(req.isAuthenticated()){
		//Get username info
		User.getUserInfoById(req.user, function(err, user) {
			console.log("Getting user by id: "+user.username)
			var username = user.username
			res.render('index',
		  { userID : username }
		  )
	  });

	}
	else{
		res.render('index',
	  { userID : false }
	  )
	}

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

router.get('/upload', function(req, res){

	res.render('upload')
});


router.post('/upload', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.userfile;
	//var test= fs.createReadStream('public/pdfs/Portfolio-Culminating Assignment Part 2.pdf')
	//uploadFile(req.files.userfile);
	console.log()

  // Use the mv() method to place the file somewhere on your server
	  sampleFile.mv('public/pdfs/'+req.files.userfile.name, function(err) {
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });
});

function uploadFile(info){
	console.log('Creating object');
	return cos.putObject({
				 Bucket: 'books',
				 Key: info.name,
				 Body: fs.readFileSync('public/pdfs/'+info.name),
				 ContentType: 'application/pdf'
	}).promise();
}


module.exports = router;
