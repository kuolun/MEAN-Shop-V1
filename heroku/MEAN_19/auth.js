//facebook 登入驗證
module.exports = setupAuth;
var User = require('./model/user');

//傳入User model
function setupAuth(User, app, Config) {
    //使用前要先到FB Developers建立app，取得app ID跟app secret
    //要提供給strategy
    var passport = require('passport'),
        FacebookStrategy = require('passport-facebook').Strategy;

    // High level serialize/de-serialize configuration for passport
    //user._id is saved in session and is used to retrieve the whole 
    //object via deserialize function

    //serialize  function決定user object的什麼資料要存到session
    //這邊把user的_id存到cookie
    //serializeUser的結果會attach到session變成
    //req.session.passport.user = {id:'xyz'}
    //done是strategy內部實作
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    //後續request進來時，用cookie的這個id來找到對應的user
    //找到user後會回復成req.user
    //所以每個request都會有req.user的資料
    //所以在api更新購物車那邊就會有user的資料
    passport.deserializeUser(function(id, done) {
        // User.findOne({ _id: id }).exec(done);
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    //Facebook strategy allows users to log in to a web application using their Facebook account
    //Facebook authentication works using OAuth 2.0
    // 設定FB auth strategy--使用FB帳號跟OAuth token來驗證user
    passport.use(new FacebookStrategy({
            // clientID: process.env.FACEBOOK_CLIENT_ID,
            clientID: '1035056279864779',
            // clientID: Config.facebookClientId,
            // clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            clientSecret: '7c35c679194c13abc9b381f7fa5f5f69',
            // clientSecret: Config.facebookClientSecret,
            callbackURL: 'https://mean-shop-v1.herokuapp.com/auth/facebook/callback',
            // Necessary for new version of Facebook graph API
            profileFields: ['id', 'emails', 'name']
        }, //strategy的verify callback
        //done也是callback,要傳入user來完成認證
        //profile會有use的FB資料(上面設定的id/email/name欄位)
        function(token, refreshToken, profile, done) {
            // asynchronous
            process.nextTick(function() {
                //如果profile的email存在,就用profile的is去DB新增一筆user data
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

                        //profile是FB回傳的資訊
                        // set all of the facebook information in our user model
                        newUser.facebook = profile.id; // set the users facebook id                   
                        newUser.token = token; // we will save the token that facebook provides to the user                    
                        newUser.profile.username = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                        newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                        newUser.profile.picture = 'https://graph.facebook.com' + profile.id + '/picture?type=large';

                        // save our user to the database
                        newUser.save(function(err) {
                            if (err) {
                                throw err;
                            }
                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }
                });
            });
        }
    ));







    // Express middlewares
    //產生cookie時加上secret來做hash
    //保證傳回來的資料沒被改過
    app.use(require('express-session')({
        secret: 'this is a secret'
    }));

    app.use(passport.initialize());
    app.use(passport.session());


}