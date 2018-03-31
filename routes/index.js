var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Book = require('../models/book');
const fileUpload = require('express-fileupload');
var AWS = require('ibm-cos-sdk');
var util = require('util');
var fs = require('fs')
const uuidv1 = require('uuid/v1');
const {google} = require('googleapis');
const firebase = require('firebase');
const googleStorage = require('@google-cloud/storage');
const Multer = require('multer');


var config = {
    endpoint: 's3-api.dal-us-geo.objectstorage.softlayer.net',
    apiKeyId: 't4YOTrcghfoTuvquMx1Bkg2uchGEC9pJ6mxQb8LisCO5',
    ibmAuthEndpoint: 'https://iam.ng.bluemix.net/oidc/token',
    serviceInstanceId: 'crn:v1:bluemix:public:cloud-object-storage:global:a/104bbcddeeca5a683ecec702a10d3c05:f2114b17-7a1d-42f0-a4b1-bcf5b0840bae::',
};

var cos = new AWS.S3(config);

//var admin = require("firebase-admin");

//var serviceAccount = require("../formidable-rune.json");

//admin.initializeApp({
//  credential: admin.credential.cert(serviceAccount),
//  databaseURL: "https://formidable-rune-199321.firebaseio.com",
//  storageBucket: "gs://formidable-rune-199321.appspot.com/"
//});

//var storageRef = admin.storage().ref();

const storage = googleStorage({
  projectId: "formidable-rune-199321",
  keyFilename: "formidable-rune.json"
});

const bucket = storage.bucket("formidable-rune-199321.appspot.com");

// Get Homepage
router.get('/', function(req, res){
	console.log("The username here is "+req.user)
  var isLoggedIn = false
	var menuBar;
	console.log("Doing google drive")
	//googleDrive();
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

router.get('/book/:bookID', function(req, res){
	console.log("Book is set to " + req.params.bookID);

  var tempFile="public/pdfs/"+req.params.bookID+".pdf";
  fs.readFile(tempFile, function (err,data){
     res.contentType("application/pdf");
     res.send(data);
  });
});

router.get('/read/:bookID', function(req, res){
	var tempFile="public/pdfs/"+req.params.bookID+".pdf";
	res.render('read',
	{ bookID : req.params.bookID }
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

router.get('/browse', function(req, res){
  Book.getBooks(null, function(err, books){
		 if(err){
       res.send(err)
     }
     if(req.isAuthenticated()){
       console.log("We are authenticated")
       res.render('browse',{ bookArray : books, userID: true })
     }
     else{
       res.render('browse',{ bookArray : books, userID: false })
     }
	 })
  //res.render('browse')
});



router.get('/upload', ensureAuthenticated, function(req, res){
	res.render('upload')
});


router.post('/upload',ensureAuthenticated, function(req, res) {
  if (!req.files.chooseFile){

    res.render('upload',
    { fileNotUploaded : true }
    )
  }
  else{
    var genre=req.body.genre
    if(genre == "Pick a Genre"){
        res.render('upload',
        { notUploaded : true }
        )

    }
    else{
      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      let sampleFile = req.files.chooseFile;
      User.getUserInfoById(req.user, function(err, user) {
        console.log("Getting user by id: "+user.username)
        var username = user.username
        var id = uuidv1();
      	var newBook = {
      	 "_id": id,
      	 "title": req.files.chooseFile.name,
      	 "genre": req.body.genre,
      	 "description": "",
      	 "views": 0,
      	 "rating": 0,
      	 "authorID": req.user,
         "authorUsername": username
      	 }

      	Book.createBook(newBook, function(err, book){
      		 if(err) throw err;
      		 console.log("ESKITTIT"+book);
      	 })

      	//var test= fs.createReadStream('public/pdfs/Portfolio-Culminating Assignment Part 2.pdf')
      	//uploadFile(req.files.userfile);
      	console.log()
      	User.getUserInfoById(req.user, function(err, user){
      		if(err) throw err;
      		console.log("User is:"+JSON.stringify(user))
      		if(user.book_ids == ""){
      			user.book_ids = id
      		}
      		else{
      			user.book_ids = user.book_ids +","+id
      		}
      		console.log("Updated user is:"+JSON.stringify(user))
      		User.updateUser(user, function(err, updatedUser){
      			if(err) throw err;
      			console.log("User is:"+JSON.stringify(updatedUser))
      			user.book_ids = updatedUser.book_ids +","+id
      			console.log("Updated user is:"+JSON.stringify(updatedUser))
      		})
      	})

/*
        if (sampleFile) {
          uploadImageToStorage(sampleFile).then((success) => {
            res.status(200).send({
              status: 'success'
            });
          }).catch((error) => {
            console.error(error);
          });
        }
*/
      //   Use the mv() method to place the file somewhere on your server
      	  sampleFile.mv('public/pdfs/'+id+'.pdf', function(err) {
            if (err){
              res.render('upload',
              { notUploaded : true }
              )
            }
            else{
              res.render('profile',
                { uploaded : true }
              )
            }
        });

      });
    }
  }
});



function uploadtoFirebase(file){

}

/**
 * Upload the image file to Google Storage
 * @param {File} file object that will be uploaded to Google Storage
 */
const uploadImageToStorage = (file) => {
  let prom = new Promise((resolve, reject) => {
    if (!file) {
      reject('No image file');
    }
    let newFileName = file.name;
    let fileUpload = bucket.file(newFileName);


    const blobStream = fileUpload.createWriteStream({

      metadata: {
        contentType: file.mimetype
      }
    });

    blobStream.on('error', (error) => {
      reject('Something is wrong! Unable to upload at the moment.');
    });

    blobStream.on('finish', () => {
      // The public URL can be used to directly access the file via HTTP.
      const url = "https://storage.googleapis.com/"+bucket.name+"/"+fileUpload.name

      console.log("OMG DONE : "+url)
      resolve(url);
    })

    blobStream.end(file.buffer);

  });
  return prom;
}


const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
  }
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

function googleDrive(){
	var drive = google.drive('v3');
  var fileMetadata = {
         'name': 'uploadImageTest.jpeg'
      };
  var media = {
          mimeType: 'image/png',
          //PATH OF THE FILE FROM YOUR COMPUTER
          body: fs.createReadStream('public/images/newapp-icon.png')
      };

      drive.files.create({
          auth: auth,
          resource: fileMetadata,
          media: media,
          fields: 'id'
      }, function (err, file) {
      if (err) {
          // Handle error
          console.error(err);
      } else {
          console.log('File Id: ', file.id);
      }
   });
}

module.exports = router;
