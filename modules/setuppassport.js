const passport = require("passport");
const { ConnectToPlayerIO, CheckErrorCode, RegisterToPlayerIO } = require("./data");

var LocalStrategy = require("passport-local").Strategy;

module.exports = function(){
    passport.serializeUser(function(user, done) {
        console.log("[passport.serializeUser]: " + user.connectUserId);
        done(null, user);
    });
    
    passport.deserializeUser(function(user, done){
        console.log("[passport.deserializeUser]: " + user.connectUserId);
        done(null, user);
        // ConnectToPlayerIO(user.connectUserId, user.password)
        // .then(result => {
        //     done(null, result);
        // })
        // .catch(error => {
        //     let err = CheckErrorCode(error);
        //     done(null, false);
        // });
    });

    passport.use("login", new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, function(username, password, done){
        console.log("[passport 'login']: Login using username: " + username + ", and password: " + password);
        ConnectToPlayerIO(username, password)
        .then(result => {
            console.log("[passport 'login']: Login successful");
            return done(null, result);
        })
        .catch(error => {
            console.log("[passport 'login']: Login failed");
            let err = CheckErrorCode(error);
            return done(null, false, { message: err.message });
        });
    }));
    
    passport.use("signup", new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, function(username, password, done){
        console.log("[passport 'signup']: Signing up using username: " + username + ", and password: " + password);
        RegisterToPlayerIO(username, password)
        .then(result => {
            console.log("[passport 'signup']: Sign up successful");
            return done(null, result);
        })
        .catch(error => {
            console.log("[passport 'signup']: Sign up failed");
            let err = CheckErrorCode(error);
            return done(null, false, { message: err.message });
        });
    }));
}