const express = require("express");
const router = express.Router();
const {GetRooms, GetResults, CheckErrorCode} = require("./data");
const passport = require("passport");

router.use(function(req, res, next){
    console.log(req.user);
    res.locals.currentUser = req.user;
    res.locals.info = req.flash("info");
    res.locals.error = req.flash("error");
    next();
});

router.get("/", function(req, res){
    if (res.locals.currentUser != null || res.locals.currentUser != undefined){
        res.redirect("/home");
        return;
    }
    
    res.render("index");
    console.log("Viewing login page");
});

router.get("/home", function(req, res) {
    if (res.locals.currentUser == null || res.locals.currentUser == undefined){
        res.redirect("/");
        return;
    }
    GetRooms()
    .then(result => {
        res.render("roomlist", { rooms: result });
        console.log("Viewing home page with room list(s)");
    })
    .catch(error => {
        if (error.code_id == 5) {
            res.redirect("/");
        }
        else {
            res.render("roomlist", { rooms: null });
        }
    });
});

router.get("/signup", function(req, res){
    if (res.locals.currentUser == null || res.locals.currentUser == undefined){
        res.redirect("/");
        return;
    }

    res.render("signup");
    console.log("Viewing signup page");
});

router.get("/logout", function(req, res, next){
    if (res.locals.currentUser == null || res.locals.currentUser == undefined){
        res.redirect("/");
        return;
    }

    req.logout(function(err){
        if(err) { return next(err); }
        res.redirect("/");
    });
});

router.get("/createroom", function(req, res){
    if (res.locals.currentUser != null || res.locals.currentUser != undefined){
        res.render("createroom");
        console.log("Viewing createroom page");
        return;
    }

    res.redirect("/home");
});

router.post("/login", passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/",
    failureFlash: true
}));

router.post("/signup", function(req, res, next){
    if (res.locals.currentUser == null || res.locals.currentUser == undefined){
        res.redirect("/");
        return;
    }

    var username = req.body.username;
    var password = req.body.password;
    var regEx = /^[0-9a-zA-Z]+$/;

    if (username.length < 3){
        req.flash("error", "Username length must be equal or above 3");
        return res.redirect("/signup");
    }
    if (password.length < 3) {
        req.flash("error", "Password length must be equal or above 3");
        return res.redirect("/signup");
    }
    if (!username.match(regEx)){
        req.flash("error", "Please enter letters and numbers only");
        return res.redirect("/signup");
    }
    if (!password.match(regEx)){
        req.flash("error", "Please enter letters and numbers only");
        return res.redirect("/signup");
    }
    next();
}, passport.authenticate("signup", {
    successRedirect: "/",
    failureRedirect: "/signup",
    failureFlash: true
}));

router.post("/result", function(req, res){
    if (res.locals.currentUser == null || res.locals.currentUser == undefined){
        res.redirect("/");
        return;
    }

    var room = req.body.viewroom;
    var roomOptions = { name: req.body.viewroomName, framing: req.body.viewroomFraming, sanksi: req.body.viewroomSanksi };
    GetResults()
    .then(result => {
        if (room < result.responseList.length){
            console.log(result.responseList[room]);
            res.render("result", { rooms: { roomIndex: room, roomName: roomOptions.name, roomFraming: roomOptions.framing, roomSanksi: roomOptions.sanksi }, result: result.responseList[room] });
        }
        else {
            console.log("[GetResults]: Index out of bounds");
            res.render("result", { rooms: { roomIndex: room, roomName: roomOptions.name, roomFraming: roomOptions.framing, roomSanksi: roomOptions.sanksi }, result: null });
        }
        console.log("Viewing result page");
    })
    .catch(error => {
        console.log(error);
        res.redirect("/");
    });
});

router.post("/createroom", function(req, res){
    if (res.locals.currentUser == null || res.locals.currentUser == undefined){
        res.redirect("/");
        return;
    }

    var roomOptions = { name: req.body.viewroomName, framing: parseInt(req.body.viewroomFraming), sanksi: parseInt(req.body.viewroomSanksi) };
    console.log(roomOptions);
    GetRooms()
    .then(result => {
        result.roomList[result.roomList.length] = { roomName: roomOptions.name, framing: roomOptions.framing, sanksi: roomOptions.sanksi };
        console.log(result.roomList[result.roomList.length - 1]);
        result.save();
        req.flash("info", "New room successfully created");
        res.redirect("/createroom");
    })
    .catch(error => {
        let err = CheckErrorCode(error);
        req.flash("error", err.message);
        res.redirect("/createroom");
    });
});

router.post("/delete", function(req, res){
    var index = req.body.roomIdx;
    GetRooms()
    .then(result => {
        console.log(result.roomList);
        result.roomList.splice(index, 1);
        console.log(result.roomList);
        result.save();
        GetResults()
        .then(roomResult =>{
            console.log(roomResult.responseList);
            roomResult.responseList.splice(index, 1);
            console.log(roomResult.responseList);
            roomResult.save();
            res.redirect("/");
        })
        .catch(error => {
            let err = CheckErrorCode(error);
            console.log(err.message);
            res.redirect("/");
        });
    })
    .catch(error => {
        let err = CheckErrorCode(error);
        req.flash("error", err);
        res.redirect("/");
    });
});

module.exports = router;
