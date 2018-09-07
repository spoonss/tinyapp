var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// URLs Database
var urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2RandomID"},
  "8d999K": {longURL: "http://www.nba.com", userID: "vancity"},
  "77999K": {longURL: "http://www.nhl.com", userID: "vancity"}
};


// Users Database
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "blahworld": {
    id: "blahworld", 
    email: "blablah@boo.com", 
    password: "damnyoubruh"
  },
  "vancity": {
    id: "vancity", 
    email: "nok@shaw.ca", 
    password: "abc"
  }
}


// Login Username - cookie
app.post('/login', (req, res) => {
  var valid = false;
  for (var user in users){
    if(users[user].email === req.body.email){
      if(users[user].password === req.body.password){
        valid = true;
        res.cookie('user_id', users[user].id);
        res.redirect('/urls');
      }
    }
  }
  
  if(!valid){
    res.status(403).send('Wrong credentials!')
  }

});

// List of URLs
app.get('/urls', (req, res) => {

  if(req.cookies["user_id"] === undefined){
    res.redirect('/login');
  } else {

  console.log(req.cookies["user_id"]);
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
    loggedIn: req.cookies["user_id"]
  };
  console.log(templateVars);
  res.render('urls_index', templateVars);
  }
});


// Create new URL page
app.get('/urls/new', (req, res) => {
  if(req.cookies["user_id"] === undefined){
    res.redirect('/login');
  } else {
    let templateVars = { user: users[req.cookies["user_id"]]};
    res.render("urls_new", templateVars);
  }
});


// Login page
app.get('/login', (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render('urls_login', templateVars);
});


// Short URL's Homepage
app.get('/urls/:id', (req, res) => {
  if(req.cookies["user_id"] === undefined){
    res.redirect('/login');
  } else {

  let templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies["user_id"]]};
  res.render('urls_show', templateVars);
  }
});

// Update URL
app.post('/urls/:id/update', (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});

// Logout 
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// New URL button
app.post('/urls', (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect('/urls/' + newShortURL);
});


// POST -- Delete URL button
app.post('/urls/:id/delete', (req, res) => {
  let targetId = req.params.id;
      delete urlDatabase[targetId];
  res.redirect('/urls');
});

// Redirect Short URL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Registration Page  
app.get("/register", (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]]};
  res.render('urls_register', templateVars);
});

// Register button
app.post('/register', (req, res) => {

  valid = false;
  if(req.body.password === '' || req.body.email === '') {
    res.status(400).send('Email and password are not allowed to be blank!');
    } else { 
      
      for (var userId in users) {
          if(users[userId].email === req.body.email){
            res.status(400).send('Email address already existed!');
          }
      }
    }
      let randomId = generateRandomString();
      users[randomId] = {id: randomId, email: req.body.email, password: req.body.password};
      //console.log(users);
      res.cookie('user_id', randomId); 
      res.redirect('/urls');
    
});



app.get('/', (req, res) => {
  res.redirect('/urls');
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



