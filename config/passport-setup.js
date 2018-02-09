const passport=require("passport");
const GoogleStrategy=require('passport-google-oauth20');
const FacebookStrategy=require('passport-facebook');
const TwitterStrategy=require('passport-twitter');
const Keys=require('./keys');
var ObjectID = require('mongodb').ObjectID;
var objectId;







passport.serializeUser(function (user, done) {
    done(null, user._id);
});
passport.deserializeUser(function (id, done) {
    objectId = new ObjectID(id);
    Keys.mongodb.database.collection("users").findOne({_id: objectId},function(err, socialUser) {
        if (err) throw err;
        else {
            console.log("deserialized user: "+JSON.stringify(socialUser));
            done(null, socialUser);
        }
    });
});





//google
passport.use(
    new GoogleStrategy({
        callbackURL:Keys.google.callbackURL,
        clientID:Keys.google.clientID,
        clientSecret:Keys.google.clientSecret
    },
    function(accessToken, refreshToken, profile, done){
       console.log("************** callback is fired **************");
        Keys.mongodb.database.collection("users").findOne({
            $or: [ {socialLinks:{providerID: profile.id, provider: "google"}},{ socialLinks: [] }]
        },function(err, socialUser) {
            if (err) throw err;
            else {
                var user={
                    name:profile.displayName,email:"", password:"", role:"user", status:"Act",
                    socialLinks:[{providerID:profile.id, provider:"google"}],activities:[],favorites:[]
                };
                if(!socialUser && Keys.passport.signUp ==true){
                    Keys.mongodb.database.collection("users").insert(user, function(err, userRes) {
                        if (err) throw err;
                        console.log("new user sign up result: "+userRes);
                        user=userRes.ops[0];
                        console.log("1 document inserted into users :"+user);
                    });
                    done(null, user);
                }
                else if(socialUser && Keys.passport.signUp !=true){
                    console.log("************** Login callback **************");
                    done(null, socialUser);
                }
                else{
                    done(null,socialUser);
                }
            }
        });
    })
);


//facebook
passport.use(
    new FacebookStrategy({
            callbackURL:Keys.facebook.callbackURL,
            clientID:Keys.facebook.clientID,
            clientSecret:Keys.facebook.clientSecret
        },
        function(accessToken, refreshToken, profile, done){
            console.log("************** callback is fired **************");
            console.log("user profile: " + JSON.stringify(profile));
            Keys.mongodb.database.collection("users").findOne({
                $or: [ {socialLinks:{providerID: profile.id, provider: "facebook"}},{ socialLinks: [] }]
            },function(err, socialUser) {
                if (err) throw err;
                else {
                    var user={
                        name:profile.displayName,email:"", password:"", role:"user", status:"Act",
                        socialLinks:[{providerID:profile.id, provider:"facebook"}],activities:[],favorites:[]
                    };
                    if(!socialUser && Keys.passport.signUp ==true){
                        Keys.mongodb.database.collection("users").insert(user, function(err, userRes) {
                            if (err) throw err;
                            console.log("new user sign up result: "+userRes);
                            user=userRes.ops[0];
                            console.log("1 document inserted into users :"+user);
                        });
                        done(null, user);
                    }
                    else if(socialUser && Keys.passport.signUp !=true){
                        console.log("************** Login callback **************");
                        done(null, socialUser);
                    }
                    else{
                        done(null,socialUser);
                    }
                }
            });
        }
    )
);



//twitter
passport.use(
    new TwitterStrategy({
            callbackURL:Keys.twitter.callbackURL,
            consumerKey:Keys.twitter.consumerKey,
            consumerSecret:Keys.twitter.consumerSecret
        },
        function(accessToken, refreshToken, profile, done){
            console.log("************** callback is fired **************");
            Keys.mongodb.database.collection("users").findOne({socialLinks:{ providerID: profile.id, provider: "twitter" }},function(err, socialUser) {
                if (err) throw err;
                else {
                    var user={
                        name:profile.displayName,email:"", password:"", role:"user", status:"Act",
                        socialLinks:[{providerID:profile.id, provider:"twitter"}],activities:[],favorites:[]
                    };
                    if(!socialUser && Keys.passport.signUp ==true){
                        Keys.mongodb.database.collection("users").insert(user, function(err, userRes) {
                            if (err) throw err;
                            console.log("new user sign up result: "+userRes);
                            user=userRes.ops[0];
                            console.log("1 document inserted into users :"+user);
                        });
                        done(null, user);
                    }
                    else if(socialUser && Keys.passport.signUp !=true){
                        console.log("************** Login callback **************");
                        done(null, socialUser);
                    }
                    else{
                        done(null,socialUser);
                    }
                }
            });
        }
    )
);