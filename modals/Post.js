const mongoose = require('mongoose')
const postSchema = new mongoose.Schema({
      title:{
           type: String,
      },
      post: {
            type:String,
      },
      name: {
            type:String,
      },
      like:{
            type:Number,
            min:0 ,
            default:0
      },
      dislike:{
            type:Number,
            min:0 ,
            default:0
      },
      comment:[{
        userName:String,
        essay:String
      }]
    
    });

module.exports =  mongoose.model("Userpost", postSchema);