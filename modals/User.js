const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
      username:{
       type:String,
       required:true,
       unique:true,
      },
      password:{ 
       type:String,
      //  required:true,
      },
      fullname:{ 
       type:String,
      //  required:true,
      },
      nickname:{ 
       type:String,
      //  required:true,
      },
      bio:{ 
       type:String
      },
      reaction:[{
        postId:String,
        lord:Number
      }]
    });

    userSchema.plugin(passportLocalMongoose) ;

   module.exports = mongoose.model("User", userSchema);