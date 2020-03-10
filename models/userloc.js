var mongoose = require("mongoose");

var userLocSchema = new mongoose.Schema({

	userid:String,
	lat:String,
	lon:String

});
module.exports = mongoose.model("Userloc",userLocSchema);