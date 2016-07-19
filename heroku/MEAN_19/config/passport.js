// config/passport.js

// 載入需要的module
var FacebookStrategy = require('passport-facebook').Strategy;


//載入User model
var User = require('../app/models/user');

//載入auth variables
var configAuth = require('./auth');


//async
var async = require('async');



// expose 這個function
module.exports = function(passport) {

    // =========================================================================
    // passport session 設定 ==================================================
    // =========================================================================
    // required for persistent login sessions (持續性login session)
    // passport needs ability to serialize and unserialize users out of session

    // 用來serialize user給session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

            // 從auth.js抓app id跟 app secret
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            profileFields: ['id', 'emails', 'displayName']
        },

        // facebook will send back the token and profile
        function(token, refreshToken, profile, done) {
            //asynchronous
            process.nextTick(function() {
                // find the user in the database based on their facebook id
                User.findOne({
                    facebook: profile.id
                }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err) {
                        console.log('DB error');
                        return done(err);
                    }


                    // if the user is found, then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that facebook id, create them
                        var newUser = new User();
                        console.log(profile);
                        //profile是FB回傳的資訊
                        // set all of the facebook information in our user model
                        newUser.facebook = profile.id; // set the users facebook id                   
                        newUser.token = token; // we will save the token that facebook provides to the user                    
                        newUser.profile.username = profile.displayName; // look at the passport user profile to see how names are returned
                        newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                        newUser.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?width=10';

                        // save our user to the database
                        newUser.save(function(err) {
                            if (err) {
                                console.log('save error');
                                throw err;
                            }

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }

                });
            });
        }));

};