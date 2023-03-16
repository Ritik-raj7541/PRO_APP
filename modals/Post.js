const mongoose = require('mongoose') ;
const User = require('./User') ;
// const {Schema} = mongoose ;
const postSchema = new mongoose.Schema({
      title:{
           type: String,
      },
      post: {
            type:String,
      },
      name:{
            type:String
      },
      UserId: {
            type:mongoose.Schema.Types.ObjectId, 
            ref:'User'
      },
      like: [{
            type:mongoose.Schema.Types.ObjectId, 
            ref:'User'
      }],
      dislike: [{
            type:mongoose.Schema.Types.ObjectId, 
            ref:'User'
      }],
      comment:[{
        userName:String,
        essay:String
      }]
    
    });

module.exports =  mongoose.model("Userpost", postSchema);