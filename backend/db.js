const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username : String,
    password : String,
    firstname : String,
    lastname : String,
})

const User = new mongoose.model('User', userSchema);

const accountschema = new mongoose.Schema({
    userId:{
       type:mongoose.Schema.Types.ObjectId,
       ref:'User',
       required:true 
    },
    balance:{
        type:Number,
        required:true
    }

})

const Account = new mongoose.model('Account', accountschema)

module.exports = {User,Account,};

