var  express 				= require("express"),
	 mongoose 				= require("mongoose"),
	 app 					= express(),
	 LocalStrategy 			= require("passport-local"),
	 bodyParser 			= require("body-parser"),
	 User					= require("./models/user"),
	 mongoose 				= require("mongoose"),
	 passport 				= require("passport"),
	 request				= require("request"),
	 passportLocalMongoose  = require("passport-local-mongoose");
	 
var un;	var loggedin = 0,y=0,like=0;

	mongoose.connect("mongodb://localhost/bookapp");
	app.set("view engine", "ejs");
	app.use(bodyParser.urlencoded({extended : true}));
	app.use(express.static("public"));
	app.use(require("express-session")({
	    secret: "Hello World",
	    resave: false,
	    saveUninitialized : false
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	passport.use(new LocalStrategy(User.authenticate()))
	passport.serializeUser(User.serializeUser())
	passport.deserializeUser(User.deserializeUser())
	//====ROUTES=====//

	app.get("/",function(req,res)
	{

				res.render("home",{loggedin	: loggedin,users:req.user,y:y});

	})
	app.get("/search/results" ,function(req,res)
	{
		var bookname = req.query.book;
		var url = "https://www.googleapis.com/books/v1/volumes?q=" + bookname + "&maxResults=30&key=AIzaSyBjzXLvk9SU8R_bnqnfu1RsWDsw4ZsaVI4";
		request(url,function(error,response,body)
		{
			if(!error&&response.statusCode === 200)
			{
					var data = JSON.parse(body);
					res.render("search",{booksdata : data,loggedin	: loggedin});
					
			}
			else if(error)
			{
				res.send("Book Not Found")
			}
		})

	})
	app.post("/search/add", function(req,res)
	{		var t=1;
			if(req.user){
		if(req.body.title1){
			for(var i=0;i<req.user.books.length;i++)
			{
				if(req.user.books[i].name===req.body.title1)
					t++;
			}
			if(t==1)
					{
						console.log(t)
						req.user.books.push(
						{
						name : req.body.title1,
						author: req.body.author1,
						thumbnail : req.body.thumbnail1,
						reading : false,
						read : false
						})
					}
					else{
						console.log(t)
					}
			}
				else{
					req.user.wishlist.push({
						name: req.body.title2,
						author:req.body.author2,
						thumbnail:req.body.thumbnail2
					})}
					req.user.save(function(err,user){
						if(err)
							console.log(err)
						else
						{
							res.redirect("/user")
						}
					})}
			else{
				console.log("Create account")
				y++;
				res.redirect("/")
			}

				})
	app.post("/user/bookstatus",isLoggedIn, function(req,res)
	{
		var z
		if(req.body.btn1 === "Reading")
			z=true;
		else if(req.body.btn2 === "Read")
			z =false
		for(var i=0;i<req.user.books.length;i++){
		if(req.user.books[i].name === req.body.title)
		{
			req.user.books[i].reading = z;
			req.user.books[i].read  = !z
		}
		req.user.save(function(err,user)
		{
			if(err)
				console.log(err)
			else
				res.redirect("/user")
		})
	}
	})
app.post("/friend/search",isLoggedIn,function(req,res){
	var friendun = req.body.friend;
	if(friendun === req.user.username)
	{
		res.redirect("/user")
	}
	else{
	User.findOne({username : friendun},function(err,user)
	{
		if(err){
			console.log(err)
			res.send("No user exist")
		}
		else{
		console.log(user)
		res.render("friend",{fun:user})	
		}
	})}
})
	app.post("/friend/:name/:book/like",isLoggedIn,function(req,res)
	{
		var book = req.params.book;
		var name = req.params.name;
		User.findOne({username:name},function(err,user){
			if(err)
				console.log(err)
			else{
				like++;
				for(var i=0;i<user.books.length;i++)
				{
					if(user.books[i].name === book)
					{
						if(like===1)
						user.books[i].like= like;
					else
						break;

					}
				}
				user.save(function(err,user)
				{
					if(err)
						console.log(err)
					else
					res.render("friend",{fun:user})

				})
				
			}
		})

	})

app.get("/user",isLoggedIn ,function(req,res)
{
	res.render("myaccnt" , {me : req.user});
})

app.post("/user/fav",isLoggedIn,function(req,res)
{
	req.user.favourites.push({
						name: req.body.title,
						author:req.body.author,
						thumbnail:req.body.thumbnail
					})
					req.user.save(function(err,user){
						if(err)
							console.log(err)
						else
						{
							res.redirect("/user")
						console.log(user)
						}
					})
})
app.get("/user/:books",isLoggedIn,function(req,res)
{
	var book = req.params.books;
	res.render("books",{book : book,me : req.user})
})
app.post("/user/reviewadded" ,isLoggedIn,function(req,res)
{
	var book = req.params.books;
	for(var i=0;i<req.user.books.length;i++)
	{
		if(req.user.books[i].title === book)
		{
			req.user.books[i].read = true;
			req.user.books[i].rate = req.body.rate;
			req.user.books[i].comment = req.body.comment;
			req.user.save(function(err,user)
			{
				if(err)
					console.log(err)
				else{
					res.redirect("/user");
					console.log(req.user.books)
				}
			})
		}
	}
})
	app.post("/user/privacy" ,isLoggedIn,function(req,res)
	{
		req.user.privateact = !req.user.privateact;
		req.user.save();
		res.redirect("/user")
	})

	app.post("/signup",function(req,res)
	{
		var x
		if(req.body.privacy === "Private")
			x = true;
		else
			x=false;

		var userName = new User({
			username:req.body.username,
			firstname: req.body.fname,
			lastname: req.body.lname,
			email : req.body.email,
			privateact : x

		});
			User.register(userName,req.body.password,function(err,user)
	{
		if(err)
		{
			console.log(err);
			loggedin = 0
			return res.render("home");
		}
		passport.authenticate("local")(req,res,function(){
			loggedin  = 1
				if(y>0)
					y =0;
			res.render("home",{loggedin : loggedin,y:y});
			console.log("LOGGED IN");
		})
	})

	})
	app.post("/login", passport.authenticate("local", 
	{
		failureRedirect : "/"
	}),function(req,res){
	loggedin = 1
	if(y>0)
		y =0;
	res.redirect("/")
	console.log("LOGGED IN");
	})


app.get("/logout",function(req,res)
{
	req.logout();
	res.redirect("/");
	loggedin = 0;
	console.log("LOGGED OUT");
})

function isLoggedIn(req,res,next)
{
	if(req.isAuthenticated())
	{
		return  next();
	}else{
			res.redirect("/")
	}
}

	app.listen(3000,function()
	{
		console.log("Server started at port 3000...");

	})