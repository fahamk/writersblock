var bcrypt = require('bcryptjs');
var Cloudant = require('@cloudant/cloudant');
var me = '1f4f3453-d758-4393-a422-2010efd3d530-bluemix'; // Set this to your own account
var password = '28a1e839547250fe22c3e85e46c9f6200a26428ccd6fa95ade3778162b939779';
var cloudant = Cloudant({account:me, password:password});
var searchBook = cloudant.db.use('books')

var Book = module.exports

module.exports.createBook = function(newBook, callback){
  Cloudant({account:me, password:password}, function(er, cloudant) {
    if (er)
      return console.log('Error connecting to Cloudant account %s: %s', me, er.message)

          // specify the database we are going to use
        // and insert a document in it
        searchBook.insert(newBook, function(err, body, header) {
          if (err)
            return console.log('[book.insert] ', err.message)

          console.log('you have inserted the book info.')
          console.log(body)
        })
  })
}

module.exports.getBookByBookname = function(bookname, callback){
  searchBook.search('book', 'newSearch', {q:'bookname:'+bookname}, function(er, result) {
     if (er) {
       throw er;
     }
     console.log("Now getting book")
     if(result.rows.length>0){
       searchBook.get(result.rows[0].id, { revs_info: true }, function(err, data) {
         console.log(`Document contents:` + JSON.stringify(data));
         console.log("And the id is "+data._id)
         callback(null, data)
       });
     }
     else{
       callback(null,false)
     }
   });
}

module.exports.getBookById = function(id, callback){
  searchBook.get(id, { revs_info: true }, function(err, data) {
    if(err){
      callback(null,false)
    }
    else{
      console.log("We successfully searched and here is the id: "+data._id);
      console.log(`Document contents:` + JSON.stringify(data));
      callback(null, data._id)
    }
  });

}

module.exports.getBookInfoById = function(id, callback){
  searchBook.get(id, { revs_info: true }, function(err, data) {
    if(err){
      callback(null,false)
    }
    else{
      console.log("We successfully searched and here is the id: "+data._id);
      console.log(`Document contents:` + JSON.stringify(data));
      callback(null, data)
    }
  });

}
