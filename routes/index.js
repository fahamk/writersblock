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
const CLOUD_BUCKET = "formidable-rune-199321.appspot.com";
var url = require('url');


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

//const storage = googleStorage({
//  projectId: "formidable-rune-199321",
//  keyFilename: "formidable-rune.json"
//});

const googleStorage = require('@google-cloud/storage');
const Multer = require('multer');

const storage = googleStorage({
  projectId: "formidable-rune-199321",
  keyFilename: "formidable-rune.json"
});

const bucket = storage.bucket("formidable-rune-199321.appspot.com");

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
  }
});







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
  var link = "https://firebasestorage.googleapis.com/v0/b/formidable-rune-199321.appspot.com/o/"+req.params.bookID+"?alt=media&token=24ef3dae-b61a-44aa-88d4-51a41952065d"
  var tempFile="public/pdfs/"+req.params.bookID+".pdf";

  Book.addViewToBook(req.params.bookID, function(err, book){
     if(err) throw err;
   })
  res.redirect(link);
  //fs.readFile(tempFile, function (err,data){
  //   res.contentType("application/pdf");
//     res.send(data);
//  });
});

router.get('/delete/:bookID', function(req, res){
	var bookID= req.params.bookID;
  Book.getBookInfoById(bookID, function(err, book){
     if(err) throw err;
     else{

       if(book.authorID==req.user){
         console.log("Yea we are deleting")
         Book.deleteBookByID(bookID, function(err, book){
            if(err) throw err;
            else{
              res.redirect('/profile')
            }
          })
      }
      else{
        res.redirect('/profile')
      }

     }
   })
});

router.get('/read/:bookID', function(req, res){
	var tempFile="public/pdfs/"+req.params.bookID+".pdf";
  Book.getBookInfoById(req.params.bookID, function(err, book){
     if(err) throw err;
     var title = book.title.substring(0, (book.title.length-4));
     res.render('read',
   	{ bookID : req.params.bookID, bookTitle : title}
   	)
   })
});

router.post('/rating/:bookID',function(req, res) {

  console.log("WE GOT A RATING BOYS"+ req.body.star + " " +req.params.bookID)
  Book.addRatingToBook(req.params.bookID, req.body.star, function(err, book){
     if(err) throw err;
   })

   Book.getBookAuthorID(req.params.bookID, function(err, id){
      if(err) throw err;

      User.updateUserRating(id, req.body.star, function(err, book){
         if(err) throw err;
       })
    })
  res.redirect('/read/'+req.params.bookID);
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
  var aid = req.user
  Book.getBooks(null, function(err, books){
		 if(err){
       res.send(err)
     }
     books.sort(function(a, b){
      return b.views - a.views;
     })
     books = books.filter(function (el) {
          console.log("The user id is: "+aid)
          console.log("The authodid is: "+el.authorID)
          if(aid == el.authorID){
            console.log("It matched")
          }
          return el.authorID == aid// Changed this so a home would match
     });
     var hasBooks = false
     if(books.length>0){
       hasBooks = true
     }
     User.getUserInfoById(aid, function(err, author){
        if(err) throw err;
        var userRating = author.rating
        var userRatingPercent = userRating * 20
        var userViews = author.numberOfRatings;
        res.render('profile',{ bookArray : books, hasBooks: true, userName: author.username, rating:userRating, percent: userRatingPercent, numberOfRatings: userViews})
      })
	 })
});

router.get('/userprofile/:userID', function(req, res){
	var aid=req.params.userID
  Book.getBooks(null, function(err, books){
		 if(err){
       res.send(err)
     }
     books.sort(function(a, b){
      return b.views - a.views;
     })
     books = books.filter(function (el) {
          console.log("The user id is: "+aid)
          console.log("The authodid is: "+el.authorID)
          if(aid == el.authorID){
            console.log("It matched")
          }
          return el.authorID == aid// Changed this so a home would match
     });
     var hasBooks = false
     if(books.length>0){
       hasBooks = true
     }
     User.getUserInfoById(aid, function(err, author){
        if(err) throw err;
        var userRating = author.rating
        var userRatingPercent = userRating * 20
        var userViews = author.numberOfRatings;
        res.render('userprofile',{ bookArray : books, hasBooks: true, userName: author.username, rating:userRating, percent: userRatingPercent, numberOfRatings: userViews})
      })
	 })
});




router.get('/browse', function(req, res){
  Book.getBooks(null, function(err, books){
		 if(err){
       res.send(err)
     }
     books.sort(function(a, b){
      return b.views - a.views;
     })

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

router.post('/browse', function(req, res){
  Book.getBooks(null, function(err, books){

		 if(err){
       res.send(err)
     }
     books.sort(function(a, b){
      return b.views - a.views;
     })
     var genre = req.body.genre
     var ratingRange = req.body.ratingRange
     var dateRange = req.body.dateRange
     var search = req.body.search
     console.log("And the search is: "+search)
     console.log("The rating range is: "+ratingRange)
     console.log("The date Range is: "+dateRange)
     if(genre != "Pick a Genre"){
       books = books.filter(function (el) {
        return el.genre == genre// Changed this so a home would match
      });
     }

     if(search){
       console.log("Yes there was a search")
       books = books.filter(function (el) {
        return el.title.includes(search)// Changed this so a home would match
      });
     }

     if(ratingRange != "Rating Range..."){
       if(ratingRange == "Highest to Lowest"){
         books.sort(function(a, b){
          return b.rating - a.rating;
         })
       }
       else{
         books.sort(function(a, b){
          return a.rating - b.rating;
         })
       }
     }
     if(dateRange != "Date Range..."){
       var today = new Date();

       if(dateRange == "past week"){
         var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
         books = books.filter(function (el) {
          return el.publishDate >= lastWeek// Changed this so a home would match
        });
       }
       else if(dateRange == "past month"){
         var lastMonth = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
         books = books.filter(function (el) {
          return el.publishDate >= lastMonth// Changed this so a home would match
        });
       }
       else if(dateRange == "past year"){
         var lastYear = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 365);
         books = books.filter(function (el) {
          return el.publishDate >= lastYear// Changed this so a home would match
        });
       }

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

function genreSet(genre) {
    return age >= 18;
}


router.get('/upload', ensureAuthenticated, function(req, res){
	res.render('upload')
});

//ADD THIS if it stops working multer.single('chooseFile'),
router.post('/upload', (req, res) => {

  if (!req.files.chooseFile){
    res.render('upload',
    { fileNotUploaded : true }
    )
  }

  else{
    var genre=req.body.genre
    console.log("From the page we got "+genre);
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
        var imageID = "None"
        if(req.files.chooseImage){
          var imageID = uuidv1();
        }
      	var newBook = {
      	 "_id": id,
      	 "title": req.files.chooseFile.name,
      	 "genre": req.body.genre,
      	 "description": "",
      	 "views": 0,
      	 "rating": 0,
         "numberOfRatings":0,
      	 "authorID": req.user,
         "authorUsername": username,
         "imageID":imageID,
         "publishDate": Date.now()
      	 }
         console.log("The genrea is "+newBook.genre)

      	Book.createBook(newBook, function(err, book){
      		 if(err) throw err;
      		 console.log("ESKITTIT"+book);
      	 })

      	//var test= fs.createReadStream('public/pdfs/Portfolio-Culminating Assignment Part 2.pdf')
      	//uploadFile(req.files.userfile);
      	console.log()
      	User.getUserInfoById(req.user, function(err, user){
      		if(err) throw err;
      		//console.log("User is:"+JSON.stringify(user))
      		if(user.book_ids == ""){
      			user.book_ids = id
      		}
      		else{
      			user.book_ids = user.book_ids +","+id
      		}
      		//console.log("Updated user is:"+JSON.stringify(user))
      		User.updateUser(user, function(err, updatedUser){
      			if(err) throw err;
      			//console.log("User is:"+JSON.stringify(updatedUser))
      			user.book_ids = updatedUser.book_ids +","+id
      			//console.log("Updated user is:"+JSON.stringify(updatedUser))
      		})
      	})


//        sendUploadToGCS(sampleFile)
          const chooseFile = req.files.chooseFile;
          const gcsname = chooseFile.name;
          const files = bucket.file(id);
          console.log("Path is: "+chooseFile.path)

          files.createWriteStream({
              metadata: {
                contentType: chooseFile.mimetype
              }
            })
            .on("error", (err) => {
              restify.InternalServerError(err);
            })
            .on('finish', () => {
              console.log("File Upload Successful")
            })
            .end(chooseFile.data);;

          console.log("We came here after upload")
          if(!req.files.chooseImage){
            res.render('profile',
              { uploaded : true }
            )
          }
          else{
            const chooseImage = req.files.chooseImage;
            const gcsname = chooseImage.name;
            const files = bucket.file(imageID);

            files.createWriteStream({
                metadata: {
                  contentType: chooseImage.mimetype
                }
              })
              .on("error", (err) => {
                restify.InternalServerError(err);
              })
              .on('finish', () => {
                res.render('profile',
                  { uploaded : true }
                )
              })
              .end(chooseFile.data);;

          }


      });
    }
  }



//////////////////////


//  if (file) {
  //  uploadImageToStorage(file).then((success) => {
  //    res.status(200).send({
  //      status: 'success'
  //    });
//    }).catch((error) => {
//      console.error(error);
//    });
//  }
});

/*
router.post('/upload', multer.single('chooseFile'),ensureAuthenticated, function(req, res) {

});

*/





module.exports = router;
