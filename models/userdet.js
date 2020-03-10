var mongoose = require("mongoose");

var userDetSchema = new mongoose.Schema({

	userid:String,
	name:String,
	state:String,
	pin:String,
	dob:String

});
module.exports = mongoose.model("Userdet",userDetSchema);