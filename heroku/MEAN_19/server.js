var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var flash = require('connect-flash');
var configDB = require('./config/database.js');

//faker
var apiRoutes = require('./api/api');
//admin 
var adminRoutes = require('./public/routes/admin');

var path = require('path');

var ejs = require('ejs');


var Category = require('./app/models/category');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport);// pass passport for configuration


// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

//ejs
app.set('view engine','ejs');

// required for passport
// resave saveUninitialized
// 新的多兩個參數
app.use(session({ secret: 'ilovekk',resave: false,saveUninitialized: false })); // session secret
// app.use(session({ secret: 'ilovekk' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


//設定路徑
// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


//讓此目錄下的html都可以作為static file
// app.use(express.static('./', { maxAge: 4 * 60 * 60 * 1000 }));
app.use(express.static(__dirname + '/public'));


//取得所有分類目錄
app.use(function(req, res, next) {
  Category.find({}, function(err, categories) {
    if (err) return next(err);
    res.locals.categories = categories;
    next();
  });
});



//faker middleware
app.use('/api',apiRoutes);
//admin
app.use(adminRoutes);

// set up our one route to the index.html file
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/views/index.html'));
});



//launch==================================================
app.listen(port);
console.log('Server is running on port ' + port + '..........');



//設定auth
// setupAuth(User, app, Config);
