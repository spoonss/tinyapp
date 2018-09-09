const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


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
    password: "$2b$10$RTdun821BJWkfs59H9UJb.S1ZwcwdOMtVwTCpTzk5LIZ88QgdnJj6"
  }
};


// Login page
app.post('/login', (req, res) => {
  if(checkEmailAndPassword(req)){
    res.redirect('/urls');
  } else {
    res.status(403).send('Wrong credentials!');
}
});



// List of URLs
app.get('/urls', (req, res) => {
  if(req.session.user_id === undefined){
    res.redirect('/login');
  } else {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
    loggedIn: req.session.user_id
  };
  res.render('urls_index', templateVars);
  }
});


// Create new URL page
app.get('/urls/new', (req, res) => {
  if(req.session.user_id === undefined){
    res.redirect('/login');
  } else {
    let templateVars = { user: users[req.session.user_id]};
    res.render("urls_new", templateVars);
  }
});


// Login page
app.get('/login', (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render('urls_login', templateVars);
});


// Short URL's Homepage
app.get('/urls/:id', (req, res) => {
  if(req.session.user_id === undefined){
    res.redirect('/login');
  } else {
      let templateVars = { 
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      user: users[req.session.user_id]};
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
  req.session = null;
  res.redirect('/urls');
});


// New URL button
app.post('/urls', (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {longURL: req.body["longURL"], userID: req.session.user_id};
  res.redirect('/urls/' + newShortURL);
});


// Delete URL button
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
  let templateVars = {user: users[req.session.user_id]};
  res.render('urls_register', templateVars);
});


// Register button
app.post('/register', (req, res) => {
  if(req.body.password === '' || req.body.email === '') {
    res.status(400).send('Email and password are not allowed to be blank!');
  }
    else if(checkEmail(req.body.email)){
      res.status(400).send('Email address already existed!');
    }
      else{
        let randomId = generateRandomString();
        let hash = bcrypt.hashSync(req.body.password, 10);
        users[randomId] = {id: randomId, email: req.body.email, password: hash};
        req.session.user_id = randomId; 
        res.redirect('/urls');
    }  
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

//Function to check email address
function checkEmail(arg){
  for (var userId in users){
    if(users[userId].email === arg){
      return true;
    }
  } return false;
}


//Function to check email address & password
function checkEmailAndPassword(arg){
  for (var user in users){
    if(users[user].email === arg.body.email && bcrypt.compareSync(arg.body.password, users[user].password)){
      arg.session.user_id = users[user].id; 
      return true;
    } 
  }return false; 
}


