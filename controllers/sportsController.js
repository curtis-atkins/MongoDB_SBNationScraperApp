var express = require("express");

var router = express.Router();

//NEED MONGODB MODELS HERE!!!!!!

router.get("/", function(req, res){
	res.render("home", hbsObject);
}) 