// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '1035056279864779', // your App ID
        'clientSecret'  : '7c35c679194c13abc9b381f7fa5f5f69', // your App Secret
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback'
    },
    // 'facebookAuth' : {
    //     'clientID'      : 'your-secret-clientID-here', // your App ID
    //     'clientSecret'  : 'your-client-secret-here', // your App Secret
    //     'callbackURL'   : 'http://localhost:3000/auth/facebook/callback'
    // },

    // 作業
    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://localhost:3000/auth/google/callback'
    }

};