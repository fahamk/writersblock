var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Cloudant = require('@cloudant/cloudant');
var me = '1f4f3453-d758-4393-a422-2010efd3d530-bluemix'; // Set this to your own account
var password = '28a1e839547250fe22c3e85e46c9f6200a26428ccd6fa95ade3778162b939779';
var cloudant = Cloudant({account:me, password:password});
var searchuser = cloudant.db.use('users')

var User = module.exports


//Create user function
module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	    });
	});
  Cloudant({account:me, password:password}, function(er, cloudant) {
    if (er)
      return console.log('Error connecting to Cloudant account %s: %s', me, er.message)
          // specify the database we are going to use
        var users = cloudant.db.use('users')
        // and insert a document in it
        users.insert(newUser, function(err, body, header) {
          if (err)
            return console.log('[users.insert] ', err.message)
          //console.log('you have inserted the user info.')
          //console.log(body)
        })
  })
}


//Upadate user info function
module.exports.updateUser = function(newUser, callback){
  Cloudant({account:me, password:password}, function(er, cloudant) {
    if (er)
      return console.log('Error connecting to Cloudant account %s: %s', me, er.message)
          // specify the database we are going to use
        var users = cloudant.db.use('users')

        // and insert a document in it
        users.insert(newUser, function(err, body, header) {
          if (err)
            return console.log('[users.insert] ', err.message)
          //console.log('you have inserted the user info.')
          //console.log(body)
        })
  })
}


//Get the user id by the username
module.exports.getUserByUsername = function(username, callback){
  searchuser.search('user', 'newSearch', {q:'username:'+username}, function(er, result) {
     if (er) {
       throw er;
     }
     //console.log("Now getting user")
     if(result.rows.length>0){
       searchuser.get(result.rows[0].id, { revs_info: true }, function(err, data) {
         //console.log(`Document contents:` + JSON.stringify(data));
        // console.log("And the id is "+data._id)

         callback(null, data)

       });
     }
     else{
       callback(null,false)
     }
   });
}

//if you have Id get user by their userid
module.exports.getUserById = function(id, callback){
  searchuser.get(id, { revs_info: true }, function(err, data) {
    if(err){
      callback(null,false)
    }
    else{
      //console.log("We successfully searched and here is the id: "+data._id);
      //console.log(`Document contents:` + JSON.stringify(data));
      callback(null, data._id)
    }
  });
}


//Compare the username with its password and the entered password
module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
      console.log("And the match is "+isMatch)
    	callback(null, isMatch);
	});
}


//Get all the userinfo with just their ID
module.exports.getUserInfoById = function(id, callback){
  searchuser.get(id, {include_docs:true}, function(err, data) {
    if(err){
      callback(null,false)
    }
    else{
      //console.log("We successfully searched and here is the id: "+data._id);
      //console.log(`Document contents:` + JSON.stringify(data));
      callback(null, data)
    }
  });
}


//Update the entire user
module.exports.updateUserInfo = function(user, callback){
  searchuser.get(user._id, { revs_info: true }, function(err, data) {
    if(err){
      callback(null,false)
    }
    else{
      //console.log("We successfully searched and here is the id: "+data._id);
      //console.log(`Document contents:` + JSON.stringify(data));

      Cloudant({account:me, password:password}, function(er, cloudant) {
        if (er)
          return console.log('Error connecting to Cloudant account %s: %s', me, er.message)

              // specify the database we are going to use
            var users = cloudant.db.use('users')
            // and insert a document in it
            users.insert(newUser, function(err, body, header) {
              if (err)
                return console.log('[users.insert] ', err.message)

              console.log('you have inserted the user info.')
              console.log(body)
            })
      })
      callback(null, data)
    }
  });
}


///Update only the user rating
module.exports.updateUserRating = function(id, rating, callback){
  searchuser.get(id, {include_docs:true}, function(err, data) {
    if(err){
      callback(null,false)
    }
    else{
			//console.log("The rating was "+data.rating)
			var currentRate = parseFloat((data.rating*data.numberOfRatings).toFixed(2))
      data.numberOfRatings = data.numberOfRatings + 1;
			data.rating = parseFloat(((currentRate + parseFloat(rating))/data.numberOfRatings).toFixed(2))
			//console.log("The rating is "+data.rating)
      //console.log("We successfully searched and here is the id: "+data._id);
      //console.log(`Document contents:` + JSON.stringify(data));

      Cloudant({account:me, password:password}, function(er, cloudant) {
        if (er)
          return console.log('Error connecting to Cloudant account %s: %s', me, er.message)

              // specify the database we are going to use
            var users = cloudant.db.use('users')
            // and insert a document in it
            users.insert(data, function(err, body, header) {
              if (err)
                return console.log('[users.insert] ', err.message)

              console.log('you have inserted the user info.')
              //console.log(body)
            })
      })
      callback(null, data)
    }
  });
}
