var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Create new URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Short URL's Homepage
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

// Update URL
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});



app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  //let templateVars = { shortURL: newShortURL, longURL: urlDatabase[newShortURL]};
  res.redirect("/urls/" + newShortURL);
});


// Delete URL button
app.post('/urls/:id/delete', (req, res) => {
  let targetId = req.params.id;
      delete urlDatabase[targetId];
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


// function(req, res)
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// Generate a random short URL 
function generateRandomString() {
	var chars = "abcdefghiklmnopqrstuvwxyz";
	var string_length = 6;
	var randomstring = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum,rnum+1);
	}
	return randomstring;
}

