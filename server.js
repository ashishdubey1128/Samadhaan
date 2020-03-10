var express = require("express");

var app = express();

var bodyParser = require("body-parser");

var request = require("request");

var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/samadhaan_app");

var passport = require("passport");

var localStrategy = require("passport-local");

// var passportLocalMongoose = require("passport-local-mongoose");

var User = require("./models/user");
var Query = require("./models/query");
var Userdet = require("./models/userdet");
var Userloc = require("./models/userloc");

app.use(require("express-session")({
	secret:"Apurva is the best",
	resave:false,
	saveUninitialized:false
}));

app.use( express.static( "public" ) );

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(bodyParser.urlencoded({extended:true}));


//Date
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!

var yyyy = today.getFullYear();
if (dd < 10) {
  dd = '0' + dd;
} 
if (mm < 10) {
  mm = '0' + mm;
} 
var today = dd + '/' + mm + '/' + yyyy;
var dt = today.toString();




app.get("/",function (req,res) {
	
	res.render("homepage.ejs");
});

app.get("/hn",function (req,res) {
	
	res.render("homehin.ejs");
});


app.get("/userpage",isLoggedIn,function(req,res)
{
	var x = req.user._id;
	x.toString();
	Query.find({userid:x},function(err,query)
		{
			if (err) {
				console.log(err);
			}
			Userdet.find({userid:x},function(errr,det)
			{
				if(errr)
				{
					console.log(errr);
				}
				res.render("userpage.ejs",{id:req.user._id,query:query,name:det});
			});

		});

});

//=============
//AUTH ROUTES
//=============

app.get("/signup",function (req,res) {
	
	res.render("signup.ejs");
});

app.post("/signup",function (req,res) {
	var newuser = new User({username:req.body.username});
	User.register(newuser,req.body.password , function (err,user) {
		if(err)
		{
			console.log(err);
			return res.render("signup.ejs");
		}
		passport.authenticate('local')(req,res,function(){
			res.redirect("/userpage");
		
		//================
		//location capture
		//================
		Userloc.create({
		userid:req.user._id,
		lat:req.body.lat,
		lon:req.body.lon
	},function(err,loc){
		if(err){
		console.log(err);
	}
	Userdet.create({
		userid:req.user._id,
		name:req.body.names,
		state:req.body.state,
		pin:req.body.pin
	},function(err,user){
		if(err)
		{
			console.log(err);
		}
	});
	});
	});
	});
});
//===============
//LOGIN
//===============


app.get("/login",function (req,res) {
	res.render("login.ejs");
});

app.post("/login", passport.authenticate("local",{
	successRedirect:"/userpage",
	failureRedirect:"/login"
}),function (req,res) {
});

//========
//logout
//========
app.get("/logout",function (req,res) {
	req.logout();
	res.redirect("/");
});

//================
//complain
//================

app.get("/userpage/:id/query",function(req,res){
	res.render("query.ejs",{id:req.user._id});
});

app.post("/:id/query",function(req,res)
{
	if(req.body.query!="")
	{
	Query.create({
		userid:req.params.id,
		query:req.body.query,
		date:dt
	},function(err,query){
		if(err){
		console.log(err);
	}
	res.redirect("/userpage");
	console.log(query);
	});
}
else
{
	res.redirect("/userpage");
}
});


app.get("/userpage/:id/viewquery",isLoggedIn,function(req,res)
{
	var x = req.params.id;
	x.toString();
	Query.find({userid:x},function(err,query)
		{
			if (err) {
				console.log(err);
			}
			res.render("queryview.ejs",{query:query,id:req.params.id});
		});
	
});

app.get("/:id/removequery",function(req,res)
{
	Query.findOneAndDelete({userid:req.params.id},function(err,query)
	{
		if(err)
		{
			console.log(err);
		}
		res.redirect("/userpage");

	});
});



//========================
//GOVERNMENT PORTAL
//========================
var c=0;
app.get("/government",function(req,res){
	c=0;
	res.render("govhome.ejs");
});

app.get("/govlogin",function(req,res){
	res.render("govlogin.ejs");
});

var ar=[]
var url = "https://newsapi.org/v2/top-headlines?country=in&category=science&apiKey=86d96574124f4c8194e6e4e5d7256cc3"
request(url,function(err,response,body){
	if(!err && response.statusCode==200)
		{		
			var parseddata =JSON.parse(body);
			parseddata.articles.forEach(function(pd){
				ar.push(pd.title);
			});
		}

});

app.post("/govlogin",function(req,res){
	if(req.body.username==="ashish" && req.body.password==="password")
	{
		res.redirect("/govpage");
		c=c+1;
	}
	else
	{
		res.redirect("/govlogin");
	}
});


app.get("/govpage",function(req,res){
	if(c!=0)
	{
	Query.find({},function(err,query)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			Userloc.find({},function(err,loc)
			{
				if(err)
				{
					console.log(err);
				}
				var x = "https://www.google.co.in/maps/@"+loc[0].lat+","+loc[0].lon+",17.06z?hl=en";
				res.render("govpage.ejs",{ar:ar,query:query,loc:x});
			});
		};
		});
	}
	else{
		res.redirect("/govlogin");
	}
});

//===========
//all query
//===========

app.get("/allquery",function(req,res)
{
	Query.find({},function(err,query)
	{
		if(err)
		{
			console.log(err);
		}
		else
		{
			Userloc.find({},function(err,loc)
			{
				if(err)
				{
					console.log(err);
				}
				var x = "https://www.google.co.in/maps/@"+loc[0].lat+","+loc[0].lon+",17.06z?hl=en";
				res.render("allquery.ejs",{query:query,loc:x});
			});
			
		}
	});
});

//=========
//solution
//=========

app.get("/:id/:uid/:q/solution",function(req,res)
{	
	console.log(req.params.q);
	res.render("addsol.ejs",{id:req.params.id,uid:req.params.uid,query:req.params.q});
});

app.post("/:id/:uid/:query/solution",function(req,res)
{
	if(req.body.sol!="")
	{
	Query.findOneAndUpdate({_id:req.params.id},{$set:{userid:req.params.uid,query:req.params.query,solution:req.body.sol,dates:dt}},function(err,query){
		if(err)
		{
			console.log(err);
		}
		console.log(query);
		res.redirect("/govpage");
	});
}
else{
	res.redirect("/govpage");
}
});


app.get("/userloc/:id/:uid",function(req,res)
{
	var z=req.params.uid;
	z.toString();
	Userloc.find({userid:z},function(err,loc)
			{
				if(err)
				{
					console.log(err);
				}
				var x = "https://www.google.co.in/maps/@"+loc[0].lat+","+loc[0].lon+",17.06z?hl=en";
				res.render("gmaps.ejs",{loc:loc});
				console.log()
			});
});


app.get("/stats",function(req,res)
{
	if (c!=0) {
		Userdet.find({},function(err,det){
		if (err) {
			console.log(err);
		}
		console.log(det);
		res.render("stats.ejs",{det:det});
	});
	}
	else
	{
		res.redirect("/govlogin");
	}

});






function isLoggedIn(req,res,next) {
	if(req.isAuthenticated())
	{
		return next();
	}
	res.redirect("/login");
}








var port = 3000;
app.listen(port||process.env.port,function () {
	console.log("Server Started!!!");
});