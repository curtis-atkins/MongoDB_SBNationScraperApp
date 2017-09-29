// Dependencies 
var express = require("express");
var exphbs  = require('express-handlebars');
var mongojs = require("mongojs");
var request = require("request");
var cheerio = require("cheerio");
console.log("Fetching SBNation headlines...");
var bodyParser = require("body-parser");


// Initialize Express
var app = express();
/*
// Set up a static folder (public) for our web app
app.use(express.static("public"));

app.use(bodyParser.urlencoded({
  extended: false
}));

app.engine("handlebars", exphbs({
  defaultLayout: "main"
}));

app.set("view engine", "handlebars");

var routes = require("./controllers/sportsController.js");

app.use("/", routes);
app.use("/update", routes);
app.use("/create", routes);
*/
// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});

// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
  // Make a request for the news section of ycombinator
  request("https://www.sbnation.com/", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a "c-entry-box--compact--article" class
    $("div.c-compact-river__entry").each(function(i, element) {
      // Save the image, title, link, author and timestamp of each article enclosed in the current element
      console.log(element);

      var image = $(element).find("noscript").text().slice(10,-9);
      var title = $(element).find("h2").text();
      var link = $(element).find("a").attr("href");
      var author = $(element).find("span[class=c-byline__item]").find("a").html();
      var timeStamp = $(element).find("time[class=c-byline__item]").text().replace("/n","").trim();

      console.log(image,title,link,author,timeStamp);
      // If this found element had both a title and a link
      if (title && link) {
        // Insert the data in the scrapedData db
        db.scrapedData.insert({
          image:image,
          title: title,
          link: link,
          author: author,
          timeStamp: timeStamp
          
        },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
          }
        });
      }
    });
    res.send("Scrape Complete");
  });

  // Send a "Scrape Complete" message to the browser
});

function scrapeSite() {

};

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
