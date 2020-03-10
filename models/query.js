var mongoose = require("mongoose");

var querySchema = new mongoose.Schema({

	userid:String,
	query:String,
	date:String,
	dates:String,
	solution:String

});
module.exports = mongoose.model("Query",querySchema);