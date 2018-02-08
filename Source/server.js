// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var fs = require("fs");
const passportSetup=require("./config/passport-setup")
const passport=require("passport")
const Keys=require('./config/keys');
var nodemailer = require('nodemailer');



//node mailer config
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {user: 'originalprice.com@gmail.com', pass: 'originalprice123'}
});




// Get our API routes
const api = require('./server/routes/api');
const app = express();


// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: Keys.session.cookieKey}));
app.use(passport.initialize());
app.use(passport.session());



// mongodb connection
var objectId;
MongoClient.connect(Keys.mongodb.locallURL, function(err, db) {
    Keys.mongodb.database=db;
    if (err) { console.log(err); throw err}
    else console.info("Connected To Database : " + db.databaseName);
});



// prepare json files and insert into database
/*
var test = require('./src/assets/labs.json');
app.get('/setMobilesData', function (req, res) {
    var products=[];
    var shops=[];
    var specifications=[];
    console.info("current Database : " + database.databaseName);
    console.info("mobiles size  : " + test.length);

    var x = test[0];
    var shopsData;
    var shopsDataX;
    var shopsDataXPrice;
    var shopsDataXUrl;

    var specificationsData;
    var specificationsDataY;
    var specificationsDataYY;
    var specificationsDataX;
    var specificationsDataXX;
    var specificationsDataXXX;
    var specificationItems=[];

    for(var i=0; i<test.length; i++){
        x=test[i];
        shopsData=x[0].shopurl;
        specificationsData=x[0].specifications;

        if(specificationsData){
            Object.getOwnPropertyNames(specificationsData).forEach(
                function (val, idx, array) {
                    specificationsDataX=specificationsData[val];
                    Object.getOwnPropertyNames(specificationsDataX).forEach(
                        function (val2, idx, array) {
                            specificationsDataXX=specificationsDataX[val2];
                            specificationsDataY=val2;
                            Object.getOwnPropertyNames(specificationsDataXX).forEach(
                                function (val3, idx, array) {
                                    specificationsDataXXX =specificationsDataXX[val3]
                                        Object.getOwnPropertyNames(specificationsDataXXX).forEach(
                                        function (val4, idx, array) {
                                            specificationsDataYY=val4;
                                        }
                                    );
                                    if(specificationsDataXXX[specificationsDataYY]){
                                        specificationItems.push({key:specificationsDataYY, value: specificationsDataXXX[specificationsDataYY]});
                                    }
                                }
                            );
                        }
                    );
                    specifications.push({specification:specificationsDataY, items: specificationItems});
                    specificationItems=[];
                }
            );
        }
        if(shopsData){
            Object.getOwnPropertyNames(shopsData).forEach(
                function (val, idx, array) {
                    shopsDataX=shopsData[val];
                    Object.getOwnPropertyNames(shopsDataX).forEach(
                        function (val2, idx, array) {
                            shopsDataXPrice = shopsDataX[val2];
                            shops.push({shopName:val2, price: shopsDataXPrice[0].price, url:shopsDataXPrice[1].url});
                        }
                    );
                }
            );
        }
        products.push({ productname: x[0].productname, category: x[0].category, brand: x[0].brand, description:x[0].description,
            images:x[0].images,
            shops:shops,
            specifications:specifications
        });
        shops=[];
        specifications=[];
    }
    Keys.mongodb.database.collection("labtops").insertMany(products, function(err, res) {
        if (err) throw err;
        console.log("Number of products documents inserted: " + res.insertedCount);
    });
    res.send(products);
});
app.get('/productsUpdate', function (req, res) {
    var newvalues = {
        $set: {reviews:[
            {userName : "Mohamed Qorany", userPhoto:"https://semantic-ui.com/images/avatar2/large/matthew.png",
                review:3, reviewText:"Good Product", date:"12/8/2017", time:"12:50"}
        ]}};
    var myquery = { category: "mobile" };

    Keys.mongodb.database.collection("products").updateMany({}, newvalues, function(err, mongo_res) {
        if (err) throw err;
        console.log(mongo_res.result.nModified + " document(s) updated");
    });
    res.send(" document(s) updated");
})


*/



/* ********************************* affiliates API *********************** */
app.get('/affiliates', function (req, res) {
    Keys.mongodb.database.collection("products").find().toArray(function(err, result) {
        if (err) throw err;
        else{
            //mobiles affiliates
            var found = false;
            var affiliates=[];
            for(var i = 0; i < result.length; i++) {
                if(result[i].shops){
                    for(var j = 0; j < result[i].shops.length; j++) {
                        for(var k = 0; k< affiliates.length; k++) {
                            if (affiliates[k].name == result[i].shops[j].shopName) {
                                found = true;break;
                            }else{found = false;}
                        }
                        if (!found){affiliates.push({name:result[i].shops[j].shopName, clicks:0})}
                    }
                }
            }

            //labtops affiliates
            Keys.mongodb.database.collection("labtops").find().toArray(function(err, result) {
                if (err) throw err;
                else{
                    var found2 = false;
                    for(var i = 0; i < result.length; i++) {
                        if(result[i].shops){
                            for(var j = 0; j < result[i].shops.length; j++) {
                                for(var k = 0; k< affiliates.length; k++) {
                                    if (affiliates[k].name == result[i].shops[j].shopName) {
                                        found2 = true;break;
                                    }else{found2 = false;}
                                }
                                if (!found2){affiliates.push({name:result[i].shops[j].shopName, clicks:0})}
                            }
                        }
                    }

                }
            });

            //set affiliates collection
           /* Keys.mongodb.database.collection("affiliates").insertMany(affiliates, function(err, res) {
                if (err) throw err;
                console.log("Number of affiliates documents inserted: " + res.insertedCount);
            });*/
            res.send(affiliates);
        }
    });
})
app.put('/affiliates/update', function (req, res) {
    console.log("update affiliate fired:"+ req.body)
    Keys.mongodb.database.collection("affiliates").updateOne({name:req.body.name},{ $inc:{clicks: 1}}, function(err, result) {
        if (err){
            console.log("updated affiliate error : "+err);
            res.send({message : "Error"});
        }
        console.log("updated");
        res.send({message : "Edited"});
    });
});
app.get('/affiliates/affiliate/:name', function (req, res) {
    Keys.mongodb.database.collection("affiliates").findOne({name:req.params.name},function(err, affiliate){
        if (err) throw err;
        else {res.send(affiliate);}
    });
});
app.get('/affiliates/all', function (req, res) {
    Keys.mongodb.database.collection("affiliates").find().toArray(function(err, affiliates) {
        if (err) throw err;
        else{
            res.send(affiliates);
        }
    });
})






/* ********************************* mobiles API *********************** */
app.get('/products/:skip', function (req, res) {
    Keys.mongodb.database.collection("mobiles").find({},{},{ skip:Number(req.params.skip), limit: 40 }).toArray(function(err, result) {
        if (err) throw err;
        else{res.send(result);}
    });
});
app.get('/mobiles/:skip', function (req, res) {
    Keys.mongodb.database.collection("mobiles").find({category: 'mobile'},{},{ skip:Number(req.params.skip), limit: 50 }).toArray(function(err, result) {
        if (err) throw err;
        else{res.send(result);}
    });
});
app.get('/search/:searchKey', function (req, res) {
    Keys.mongodb.database.collection("mobiles").find({productname: {$regex : ".*"+req.params.searchKey+"*"}}).toArray(function(err, result) {
        if (err) throw err;
        else{res.send(result);}
    });
});
app.get('/totalProducts', function (req, res) {
    var totalProducts=0;
    Keys.mongodb.database.collection("totalProductsSize").find().toArray(function(err, result) {
        if (err) throw err;
        else{res.send(result);}
    });
});
app.put('/editTotalProducts', function (req, res) {
    console.log(req.body);
    objectId = new ObjectID(req.body._id);
    Keys.mongodb.database.collection("totalProductsSize").deleteOne({_id: objectId}, function(err, resultObject) {
        if (err){res.send({message : "Error"});}
        else{
            console.log(resultObject.result.n + " document(s) updated");
            res.send({message : "updated"});
        }
    });
});
app.get('/mobiles/mobile/:id', function (req, res) {
    objectId = new ObjectID(req.params.id);
    Keys.mongodb.database.collection("mobiles").findOne({_id:objectId},function(err, mobile) {
        if (err) throw err;
        else {res.send(mobile);}
    });
});
app.put('/mobile/update', function (req, res) {
    var newvalues = {$set: {
        productname: req.body.productname, category: req.body.category, brand: req.body.brand, description:req.body.description,
        images:req.body.images,
        shops:req.body.shops,
        specifications:req.body.specifications,
        reviews:req.body.reviews
    }};
    objectId = new ObjectID(req.body._id);
    Keys.mongodb.database.collection("mobiles").updateOne({_id:objectId}, newvalues, function(err, result) {
        if (err){res.send({message : "Error"});}
        console.log("1 document updated");
        res.send({message : "Edited", product:req.body});
    });
});
app.get('/mobile/all/categories', function (req, res) {
    Keys.mongodb.database.collection("mobiles").find({},{}).toArray(function(err, result) {
        if (err) throw err;
        else{
            var categories=[]
            for(var i=0; i<result.length; i++){
                if(categories.indexOf(result[i].brand) == -1){
                    categories.push(result[i].brand);
                }
            }
            res.send(categories);
        }
    });
});
app.get('/mobiles/brand/:brand', function (req, res) {
    Keys.mongodb.database.collection("mobiles").find({category: 'mobile', brand:req.params.brand}).toArray(function(err, result) {
        if (err) throw err;
        else{res.send(result);}
    });
});
app.get('/mobiles/search/:searchText', function (req, res) {
    Keys.mongodb.database.collection("mobiles").find(
        {productname:{ $regex: req.params.searchText, $options: "i" }}).toArray(function(err, result) {
        if (err) throw err;
        else{res.send(result);}
    });
});




/* ********************************* labtops API *********************** */
app.get('/labTops/:skip', function (req, res) {
    Keys.mongodb.database.collection("labtops").find({},{},{ skip:Number(req.params.skip), limit: 50 }).toArray(function(err, result) {
        if (err) throw err;
        else{res.send(result);}
    });
});
app.get('/labTops/lab/:id', function (req, res) {
    objectId = new ObjectID(req.params.id);
    Keys.mongodb.database.collection("labtops").findOne({_id:objectId},function(err, labTop) {
        if (err) throw err;
        else {res.send(labTop);}
    });
});
app.get('/labTops/all/categories', function (req, res) {
    Keys.mongodb.database.collection("labtops").find().toArray(function(err, result) {
        if (err) throw err;
        else{
            var categories=[];
            for(var i=0; i<result.length; i++){
                if(categories.indexOf(result[i].brand) == -1){
                    categories.push(result[i].brand);
                }
            }
            res.send(categories);
        }
    });
});
app.get('/labTops/brand/:brand', function (req, res) {
    Keys.mongodb.database.collection("labtops").find({brand:req.params.brand}).toArray(function(err, result) {
        if (err) throw err;
        else{res.send(result);}
    });
});
app.put('/labTops/update', function (req, res) {
    var newvalues = {$set: {
        productname: req.body.productname, category: req.body.category, brand: req.body.brand, description:req.body.description,
        images:req.body.images,
        shops:req.body.shops,
        specifications:req.body.specifications,
        reviews:req.body.reviews
    }};
    objectId = new ObjectID(req.body._id);
    Keys.mongodb.database.collection("labtops").updateOne({_id:objectId}, newvalues, function(err, result) {
        if (err){res.send({message : "Error"});}
        console.log("1 document updated");
        res.send({message : "Edited", product:req.body});
    });
});
app.get('/labTops/search/:searchText', function (req, res) {
    Keys.mongodb.database.collection("labtops").find(
        {productname:{ $regex: req.params.searchText, $options: "i" }}).toArray(function(err, result) {
        if (err) throw err;
        else{res.send(result);}
    });
});





/* ********************************* Auth API *********************** */
app.post('/login', function (req, res) {
    Keys.mongodb.database.collection("users").findOne({email: req.body.email, password:req.body.password}, function(err, result) {
        if (err){
            throw err;
            res.send({});
        }
        else{
            req.session.user = result;
            console.log("session user after local login : "+  req.session.user);
            res.send(result);
        }
    });
});
app.post('/signUp', function (req, res) {
    Keys.mongodb.database.collection("users").insert(req.body, function(err, userRes) {
        if (err){
            throw err;
            res.send({});
        }
        else{
            console.log("new user local sign up result: "+JSON.stringify(userRes.ops[0]));
            req.session.user = userRes.ops[0];
            res.send(userRes.ops[0]);
        }
    });
});
app.get('/logout', function(req, res){
    req.logout();
    req.session.destroy(function(){console.log("user logged out.")});
    res.redirect('/');
});
function isLoggedIn(req, res, next) {if(req.user){next();} else {res.redirect('/');}}
app.get('/checkLogin', function (req, res) {
    var curentUserID;
    if(req.user){curentUserID=req.user._id;}
    else if(req.session.user){curentUserID=req.session.user._id;}
    else{curentUserID="1";}

    console.log("passport user : " + req.user);
    console.log("session user : " + req.session.user);

    if(curentUserID !=="1"){
        objectId = new ObjectID(curentUserID);
        var objectId2 = new ObjectID(curentUserID);
        Keys.mongodb.database.collection("users").findOne({ $or : [ { _id : objectId }, {_id: objectId2 } ] }, function(err, result) {
            if (err) throw err;
            res.send(result);
        });
    }else{res.send({});}
});







/***************************** passport auth *************************/
///////////////////////////// google ////////////////////////////
app.get('/auth/google', passport.authenticate('google',{scope:['profile']}));
app.get('/auth/google/redirect', passport.authenticate('google'), function(req, res) {
    res.redirect('/');
    // res.send('You reached the callbackURL user data : '+JSON.stringify(req.user));
});
app.get('/auth/google/signUp', function(req, res) {
    Keys.passport.signUp=true;
    res.redirect('/auth/google');
});
app.get('/auth/google/login', function(req, res) {
    Keys.passport.signUp=false;
    res.redirect('/auth/google');
});

///////////////////////////// facebook ////////////////////////////
app.get('/auth/facebook', passport.authenticate('facebook',{ scope : 'email' }));
app.get('/auth/facebook/redirect', passport.authenticate('facebook'), function(req, res) {
    // res.send('You reached the callbackURL user data : '+JSON.stringify(req.user));
    res.redirect('/');
});
app.get('/auth/facebook/signUp', function(req, res) {
    Keys.passport.signUp=true;
    res.redirect('/auth/facebook');
});
app.get('/auth/facebook/login', function(req, res) {
    Keys.passport.signUp=false;
    res.redirect('/auth/facebook');
});


///////////////////////////// twitter ////////////////////////////
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/redirect', passport.authenticate('twitter'), function(req, res) {
    // res.send('You reached the callbackURL user data : '+JSON.stringify(req.user));
    res.redirect('/');
});
app.get('/auth/twitter/signUp', function(req, res) {
    Keys.passport.signUp=true;
    res.redirect('/auth/twitter');
});
app.get('/auth/twitter/login', function(req, res) {
    Keys.passport.signUp=false;
    res.redirect('/auth/twitter');
});
// app.use('/users', function(req, res, next){isLoggedIn(req, res, next);});
// app.use('/categories', function(req, res, next){isLoggedIn(req, res, next);});
app.use('/profile', function(req, res, next){isLoggedIn(req, res, next);});




/* ********************************* users API *********************** */
app.get('/users', function (req, res) {
    Keys.mongodb.database.collection("users").find().toArray(function(err, result) {
        if (err) throw err;
        else{res.send(result);}
    });
});
app.post('/users/add', function (req, res) {
    console.log(req.body);
    Keys.mongodb.database.collection("users").insertOne(req.body, function(err, result) {
        if (err){res.send({message : "Error"});}
        else{res.send({message : "saved"});}
    });
});
app.put('/users/delete', function (req, res) {
    console.log(req.body);
    objectId = new ObjectID(req.body._id);
    Keys.mongodb.database.collection("users").deleteOne({_id: objectId}, function(err, resultObject) {
        if (err){res.send({message : "Error"});}
        else{
            console.log(resultObject.result.n + " document(s) deleted");
            res.send({message : "Deleted"});
        }
    });
});
app.put('/users/edit', function (req, res) {
    objectId = new ObjectID(req.body._id);
    Keys.mongodb.database.collection("users").updateOne({_id:objectId},
        { name: req.body.name, email:req.body.email,password:req.body.password, role:req.body.role, status: req.body.status },
        function(err, resultObject) {
        if (err){res.send({message : "Error"});}
        else{
            console.log(resultObject.result.nModified + " document(s) updated");
            res.send({message : "Edited", user:req.body});
        }
    });
});
app.get('/users/set', function (req, res) {
    var users=[
        {name:"Mohamed Qorany",email:"mohamedkorany600@gmail.com", password:"mohamed", role:"admin", status:"Act",
        socialLinks:[
            {providerID:"115536137761745501231", provider:"google"},
            {providerID:"708112352711686", provider:"facebook"},
            {providerID:"743139916016652288", provider:"twitter"}
        ],activities:[],favorites:[]},
        {name:"Mohamed Ahmed",email:"mohamedkorany600@gmail.com", password:"mohamed", role:"admin", status:"Act",
            socialLinks:[],activities:[],favorites:[]},
        {name:"Mohamed Ali",email:"mohamedkorany600@gmail.com", password:"mohamed", role:"admin", status:"Act",
            socialLinks:[],activities:[],favorites:[]},
        {name:"Ali Qorany",email:"mohamedkorany600@gmail.com", password:"mohamed", role:"moderator", status:"Act",
            socialLinks:[],activities:[],favorites:[]},
        {name:"Ahmed Qorany",email:"mohamedkorany600@gmail.com", password:"mohamed", role:"moderator", status:"Act",
            socialLinks:[],activities:[],favorites:[]},
        {name:"Mohamed Mahmoud",email:"mohamedkorany600@gmail.com", password:"mohamed", role:"moderator", status:"Not Act",
            socialLinks:[],activities:[],favorites:[]},
        {name:"Mahmoud Qorany",email:"mohamedkorany600@gmail.com", password:"mohamed", role:"moderator", status:"Act",
            socialLinks:[],activities:[],favorites:[]},
        {name:"marwan Qorany",email:"mohamedkorany600@gmail.com", password:"mohamed", role:"user", status:"Act",
            socialLinks:[],activities:[],favorites:[]},
        {name:"mona Ahmed",email:"mohamedkorany600@gmail.com", password:"mohamed", role:"user", status:"Act",
            socialLinks:[],activities:[],favorites:[]},
        {name:"Nor Ali",email:"mohamedkorany600@gmail.com", password:"mohamed", role:"user", status:"Not Act",
            socialLinks:[],activities:[],favorites:[]},
    ];
    Keys.mongodb.database.collection("users").insertMany(users, function(err, res) {
        if (err) throw err;
        console.log("Number of users documents inserted: " + res.insertedCount);
    });
    res.send(users);
});
app.put('/user/activity', function (req, res) {
    objectId = new ObjectID(req.body.id);
    Keys.mongodb.database.collection("users").updateOne({_id:objectId},
        { $push : { activities: req.body.activity} },
        function(err, resultObject) {
            if (err){res.send({message : "Error"});}
            else{
                console.log(resultObject.result.nModified + " document(s) updated");
                res.send({message : "Edited"});
            }
        });
});
app.put('/user/addFavorite', function (req, res) {
    objectId = new ObjectID(req.body.id);
    Keys.mongodb.database.collection("users").updateOne({_id:objectId},
        { $push : { favorites: req.body.favorite} },
        function(err, resultObject) {
            if (err){res.send({message : "Error"});}
            else{
                console.log(resultObject.result.nModified + " document(s) updated");
                res.send({message : "Edited"});
            }
    });
});
app.post('/users/verify/mail', function (req, res) {
    var mailOptions = {
        from: 'originalprice.com@gmail.com',
        to: req.body.email,
        subject:'OriginalPrice Verification',
        html: '<h1>Welcome</h1><p>Your OriginalPrice Account Verification code is :</p><b>'+req.body.code+'</b>'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            res.send({message:"error"});
        }else {
            res.send({message:"don"});
            console.log('Email sent: ' + info.response);
        }
    });
});






/* ********************************* Categories API *********************** */
app.get('/categories', function (req, res) {
    Keys.mongodb.database.collection("categories").find().toArray(function(err, result) {
        if (err) throw err;
        else{res.send(result);}
    });
});
app.post('/categories/add', function (req, res) {
    Keys.mongodb.database.collection("categories").insertOne(req.body, function(err, result) {
        if (err){res.send({message : "Error"});}
        else{res.send({message : "saved"});}
    });
});
app.put('/categories/delete', function (req, res) {
    console.log(req.body);
    objectId = new ObjectID(req.body._id);
    Keys.mongodb.database.collection("categories").deleteOne({_id: objectId}, function(err, resultObject) {
        if (err){res.send({message : "Error"});}
        else{
            console.log(resultObject.result.n + " document(s) deleted");
            res.send({message : "Deleted"});
        }
    });
});
app.put('/categories/edit', function (req, res) {
    objectId = new ObjectID(req.body._id);
    Keys.mongodb.database.collection("categories").updateOne({_id:objectId},{ name: req.body.name, status: req.body.status }, function(err, resultObject) {
        if (err){res.send({message : "Error"});}
        else{
            console.log(resultObject.result.nModified + " document(s) updated");
            res.send({message : "Edited", category:req.body});
        }
    });
});
app.get('/categories/set', function (req, res) {
    var categories=[
        {name:"mobile",status:"Act"},{name:"laptops",status:"Act"},{name:"computers",status:"not Act"},{name:"TV",status:"not Act"}
    ];
    Keys.mongodb.database.collection("categories").insertMany(categories, function(err, res) {
        if (err) throw err;
        console.log("Number of categories documents inserted: " + res.insertedCount);
        database.close();
    });
    res.send(categories);
});










// Point static path to dist
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Set our api routes
app.use('/api', api);
// Catch all other routes and return the index file
app.get('*', function(req, res){res.sendFile(path.join(__dirname, 'public/index.html'));});
const port = process.env.PORT || '3000';
app.set('port', port);
const server = http.createServer(app);
server.listen(port, () => console.log(`API running on localhost:${port}`));