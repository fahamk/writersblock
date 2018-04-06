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

        //  console.log('you have inserted the book info.')
        //  console.log(body)
        })
  })
}

module.exports.getBookByBookname = function(bookname, callback){
  searchBook.search('book', 'newSearch', {q:'bookname:'+bookname}, function(er, result) {
     if (er) {
       throw er;
     }
     //console.log("Now getting book")
     if(result.rows.length>0){
       searchBook.get(result.rows[0].id, { revs_info: true }, function(err, data) {
         //console.log(`Document contents:` + JSON.stringify(data));
         //console.log("And the id is "+data._id)
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
      //console.log("We successfully searched and here is the id: "+data._id);
      //console.log(`Document contents:` + JSON.stringify(data));
      callback(null, data._id)
    }
  });

}

module.exports.getBookInfoById = function(id, callback){
  searchBook.get(id, {include_docs:true}, function(err, data) {
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

module.exports.deleteBookByID = function(id, callback){
  searchBook.get(id, { revs_info: true }, function(err, data) {
    if(err){
      callback(null,false)
    }
    else{
      var latestRev = data._rev;
      searchBook.destroy(id, latestRev, function(err, body, header) {
        if (!err) {
            console.log("Successfully deleted doc", id);
        }
      });
      //console.log("We successfully searched and here is the id: "+data._id);
      //console.log(`Document contents:` + JSON.stringify(data));
      callback(null, data)
    }
  });
}

module.exports.getBookAuthorID = function(id, callback){
  searchBook.get(id, {include_docs:true}, function(err, data) {
    if(err){
      callback(null,false)
    }
    else{
      //console.log("We successfully searched and here is the id: "+data._id);
      //console.log(`Document contents:` + JSON.stringify(data));
      callback(null, data.authorID)
    }
  });
}

module.exports.getBooks = function(id, callback){
  searchBook.list({include_docs:true},function (err, data) {
    if(err){
      callback(null,false)
    }
    //console.log(err, data.rows);
    else{

      var booksArray =[];

      for(i in data.rows){
        var title = data.rows[i].doc.title
        var genre = data.rows[i].doc.genre
        var imageURL = "http://www.simonowens.net/wp-content/uploads/2014/12/books-2.png"
        if(genre == "Science fiction"){
          imageURL ="http://best-sci-fi-books.com/wp-content/uploads/2017/02/underrated.png"
        }
        else if(genre ==  "Satire"){
          imageURL = "https://cdn-images-1.medium.com/max/1280/1*tSijw6xZNwOduQCy4_ui7Q.jpeg"
        }
        else if(genre == "Action and Adventure"){
          imageURL = "http://media.tnh.me/5620fedf067d7b5bad890639/5624f261067d7b268f8d6f1e"
        }
        else if( genre == "Romance"){
          imageURL = "https://www.thelocal.es/userdata/images/article/ef92d177383bcc252197fedd95ff10bd1586ac31802a693ad3d9685c1356313a.jpg"
        }
        else if(genre == "Mystery"){
          imageURL = "http://resources2.atgtickets.com/static/33540_full.jpg"
        }
        else if(genre == "Horror"){
          imageURL = "http://horror.wpengine.netdna-cdn.com/wp-content/uploads/2018/02/pen2-1024x576-2-1024x576-1024x576-1024x576.jpg"
        }
        else if(genre == "Comics"){
          imageURL = "https://image.freepik.com/free-vector/comic-book-page-elements_23-2147493624.jpg"
        }
        else if(genre == "Art"){
          imageURL = "http://simpleabstract.com/assets/images/Oil-On-Canvas-Abstract-Art.jpg"
        }
        else if(genre == "Fantasy"){
          imageURL = "https://i.kinja-img.com/gawker-media/image/upload/s--O4IwPdf1--/c_scale,fl_progressive,q_80,w_800/l5luskqeprim7l1llid2.jpg"
        }
        else if(genre == "Self help"){
          imageURL = "https://previews.123rf.com/images/dizanna/dizanna1506/dizanna150601456/41206493-self-help-word-cloud-health-concept.jpg"
        }
        else if(genre == "Health"){
          imageURL = "http://cdn.bukisa.com/wp-content/uploads/2017/09/F.jpg"
        }

        else if(genre == "Guide"){
          imageURL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGw5KMixExAo1YrdsfPWyHcdP0NW1RPKO0bn6Drz_sWL7nNYTA"
        }

        console.log("The image url is: "+imageURL);
        var percent = data.rows[i].doc.rating * 20
        var book = {id:data.rows[i].id, title:title.substring(0, (title.length-4)), rating:data.rows[i].doc.rating, views:data.rows[i].doc.views, genre:data.rows[i].doc.genre, authorID:data.rows[i].doc.authorID, description:data.rows[i].doc.description, authorUsername:data.rows[i].doc.authorUsername, imageURL: imageURL, numberOfRatings:data.rows[i].doc.numberOfRatings, publishDate: data.rows[i].doc.publishDate, percent: percent };
        var test = {authorUsername:data.rows[i].doc.authorUsername}
        booksArray.push(book)
      }
      //console.log(booksArray);
      //console.log("----------------------------------------------------------------------------------------")
      callback(null, booksArray)
  }
  });
}



module.exports.addViewToBook = function(id, callback){
  searchBook.get(id, {include_docs:true}, function(err, data) {
    if(err){
      callback(null,false)
    }
    else{
      //console.log("We successfully searched and here is the id: "+data._id);
      //console.log(`Document contents:` + JSON.stringify(data));
      data.views= data.views+1;
      //console.log(`Document contents:` + JSON.stringify(data));
      Cloudant({account:me, password:password}, function(er, cloudant) {
        if (er){
          return console.log('Error connecting to Cloudant account %s: %s', me, er.message)
          callback(null, false)
        }
              // specify the database we are going to use
            // and insert a document in it
        else{
          searchBook.insert(data, function(err, body, header) {
                if (err)
                  return console.log('[book.insert] ', err.message)
                callback(null, data)

              //  console.log('you have inserted the book info.')
              //  console.log(body)
          })
        }
      })
    }
  });
}

module.exports.addRatingToBook = function(id, rating, callback){
  searchBook.get(id, {include_docs:true}, function(err, data) {
    if(err){
      callback(null,false)
    }
    else{
      //console.log("We successfully searched and here is the id: "+data._id);
      //console.log(`Document contents:` + JSON.stringify(data));
      var currentRate = parseFloat((data.rating*data.numberOfRatings).toFixed(2))
      console.log("Current rate is: "+currentRate)
      data.numberOfRatings = data.numberOfRatings + 1;
      data.rating = parseFloat(((currentRate + parseFloat(rating))/data.numberOfRatings).toFixed(2))


      //console.log(`Document contents:` + JSON.stringify(data));
      Cloudant({account:me, password:password}, function(er, cloudant) {
        if (er){
          return console.log('Error connecting to Cloudant account %s: %s', me, er.message)
          callback(null, false)
        }
              // specify the database we are going to use
            // and insert a document in it
        else{
          searchBook.insert(data, function(err, body, header) {
                if (err)
                  return console.log('[book.insert] ', err.message)
                callback(null, data)

              //  console.log('you have inserted the book info.')
              //  console.log(body)
          })
        }
      })
    }
  });
}
