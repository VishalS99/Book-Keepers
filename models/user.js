var mongoose = require("mongoose"),
	passportLocalMongoose  = require("passport-local-mongoose");

var bookSchema = mongoose.Schema({
	name : String,
	author: String,
	thumbnail : String,
	reading : Boolean,
	read : Boolean,
	rate : Number,
	comment : String,
	like : Number
})
var wishlistSchema = mongoose.Schema({
	name:String,
	author:String,
	thumbnail:String
})
var favouriteSchema = mongoose.Schema({
	name:String,
	author:String,
	thumbnail:String
})
var Book = mongoose.model("Book" , bookSchema);
var Wishlist = mongoose.model("Wishlist",wishlistSchema)
var Favourite = mongoose.model("Favourite",favouriteSchema)
var UserSchema = mongoose.Schema({
	firstname : String,
	lastname  : String,
	email	  : String,
	username  : String,
	password  : String,
	privateact: Boolean,
	books     : [bookSchema],
	wishlist  : [wishlistSchema],
	favourites : [favouriteSchema]
})
UserSchema.plugin(passportLocalMongoose);   
var User = mongoose.model("User" , UserSchema);
module.exports = User;