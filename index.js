const express = require("express");
const path = require("path");
const routes = require("./modules/routes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");

const app = express();
var setUpPassport = require("./modules/setuppassport");
setUpPassport();

app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(session({
    secret: "water-sharing-o7dkbd6w0swqwslckbo0g",
    resave: false,
    saveUninitialized: true,
    
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(routes);
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/modules'));

app.listen(app.get("port"), function(){
    console.log("Server has started and running on port " + app.get("port"));
});
