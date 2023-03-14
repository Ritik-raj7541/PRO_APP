const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// var MongoDBStore = require('connect-mongodb-session')(session);
const _ = require('lodash');

const User = require('./modals/User') ;
const Post = require('./modals/Post') ;
// const bcrypt = require('bcrypt');
const session = require('express-session') ;
const passport = require('passport') ;
const passportLocalMongoose = require('passport-local-mongoose') ;

const app = express();
// var store = new MongoDBStore({
//   uri: 'mongodb://localhost:27017/proDB',
//   collection: 'mySessions'
// });
// initializingPassport(passport) ;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret:"key that will sign cookie", 
  resave: false,
  saveUninitialized: false,
  
})) ;

app.use(passport.initialize()) ;
app.use(passport.session()) ;


//configure session middleware

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/proDB");



passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//get request
app.get("/", function (req, res) {
  res.render("home");
});
app.get("/login", function (req, res) {
  res.render("login" );
});
app.get("/register", function (req, res) {
  res.render("register");
});
app.get("/main", function (req, res) {
  // const currentUser = req.session.id ;
  // console.log(currentUser) ;
  console.log('we are in main')
  // console.log(req.isAuthenticated) ;
  if(req.isAuthenticated()){
    
    const curUser = req.user.nickname ;
    Post.find({},function(err, foundPost){
      if(err){
        console.log(err) ;
      }else{
        if(foundPost){
         res.render("main" ,{postMaterial:foundPost, user:curUser});
        }else{
          res.render("main", {postMaterial:[], user:curUser}) ;
        }
      } 
    }) ;
    // res.render('main') ;
  }else{
    res.redirect('/login') ;
  }
  
  // res.render('main') ;
  
});
app.get("/compose", function (req, res) {
  if(req.isAuthenticated()){
    res.render("compose");
  }else{
    res.redirect('/login') ;
  }
  
});

app.get('/post/:postName', function(req, res){
  var id = req.params.postName ;
  
    Post.findById(id, function (err, foundPost) {
    if (err){
        console.log(err);
    }
    else{
      res.render('post', {post:foundPost}) ;
    }
   });
  
}) ;

app.get('/user/:userName', function(req, res){
   var searchedUser = req.params.userName ;
   User.find({nickname:searchedUser}, function(err, foundUser){
    if(err){
      console.log('err') ;
    }else{
       res.render('user', {user:foundUser[0]}) ;
    }
   }) ;
}) ;

app.get('/comment/:commentId', function(req, res){
   console.log(req.params.commentId) ;
   currentPostid = req.params.commentId ;
    Post.findById(currentPostid, function(err, foundPost){
    if(err){
      console.log(err) ;
    }else{
      res.render('comment', {id:currentPostid, commentPost:foundPost.comment}) ;
    }
    
   })
  
}) ;

//post request

app.post("/main", function (req, res) {

});

app.post('/like', function(req, res){
   const curUserId = req.user.id ;
   const curPostId = req.body.liked ;
   console.log(curPostId) ;

  Post.findById(curPostId, function(err, docs){
    if(err){
      console.log(err) ;
    }
    else{
      if(docs){
        if(docs.dislike.includes(curUserId)){
         Post.findByIdAndUpdate(curPostId,{$pull:{dislike:curUserId}},{new:true}, function(err, result){
           if(err){
             console.log(err) ;
           }else{
             console.log('success') ;
           }
          }) ;
        }
        if( !docs.like.includes(curUserId) ){
         Post.findByIdAndUpdate(curPostId,{$push:{like:curUserId}},{new:true}, function(err, result){
           if(err){
             console.log(err) ;
           }else{
             res.redirect('/main') ;
           }
          }) ;
        }else{
          res.redirect('/main') ;
        }
       }
    }
  })
}) ;
app.post('/dislike', function(req, res){
   const curUserId = req.user.id ;
   const curPostId = req.body.disliked ;
   console.log(curPostId) ;

  Post.findById(curPostId, function(err, docs){
   if(err){
    console.log(err) ;
   }else{
    if(docs){
      if(docs.like.includes(curUserId)){
        Post.findByIdAndUpdate(curPostId,{$pull:{like:curUserId}},{new:true}, function(err, result){
          if(err){
            console.log(err) ;
          }else{
            console.log('sucess') ;
          }
         }) ;
      }
      if(!docs.dislike.includes(curUserId)){
        Post.findByIdAndUpdate(curPostId,{$push:{dislike:curUserId}},{new:true}, function(err, result){
          if(err){
            console.log(err) ;
          }else{
            res.redirect('/main') ;
          }
         }) ;
      }else{
        res.redirect('/main') ;
      }
    }
   }  
  })
}) ;

app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username, 
    password: req.body.password
  }) ;
  req.login(user, function(err){
    if(err){
      console.log(err) ;
    }else{
      passport.authenticate('local')(req, res, function(){
        res.redirect('/main') ;
      })
    }
  })
  

});
app.post("/register", async function (req, res) {

  console.log(req.body.email) ;
  User.register({username: req.body.username ,fullname:req.body.fullname ,nickname: req.body.nickname , bio: req.body.bio}, req.body.password, function(err, user){
    if(err){
      console.log('we have a error') ;
      console.log(err) ;
      res.redirect('/register') ;
    } else{
      passport.authenticate('local')(req, res, function(){
        res.redirect('/main') ;
      })
    }
  })
});


app.post("/compose", function (req, res) {
  const heading = req.body.heading;
  const content = req.body.content;
  const newUser = new Post({
    title: heading,
    post: content,
    name: req.user.nickname 
  }) ;
  newUser.save(function(err){
    if(err){
      console.log(err) ;
    }else{
      console.log('post added successfully') ;
      res.redirect('/main') ;
    }
  });
});

app.post('/comment/:currentId', function(req, res){
    const commentbyUser = req.body.comment ;
    
    // console.log(currentPostid) ;
    // console.log(commentbyUser) ;
     Post.findById(currentPostid, function(err, foundPost){
      if(err){
        console.log(err) ;
      }else{
        foundPost.comment.push({userName:req.user.nickname, essay:commentbyUser}) ;
        foundPost.save() ;
        // console.log(foundPost.comment) ;
        res.redirect('/main') ;
      }
    }) ;
}) ;

app.post('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});



app.listen(3000, function () {
  console.log("site is running properly");
});
