const mongoose = require('mongoose');
require("dotenv").config();

mongoose.connect(process.env.MONGOURL).then(function(){
    console.log('Connected to MongoDB');
}).catch(function(err){
    console.log('Failed to connect to MongoDB', err.message);

});
module.exports = mongoose.connection;