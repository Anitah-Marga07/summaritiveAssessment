// DEPENDENCIES
const express = require("express");
const expressSession = require("express-session");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");

require("dotenv").config();
const connectDB = require("./config/db");

// Importing user model
const Signup = require("./models/Signup");

// INSTANTIATIONS
const app = express();
const port = 3007;

// CONFIGURATIONS
// setting up templating engine (pug)
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
connectDB(); //connecting to the DB

// MIDDLEWARE
//this helps us to access our static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

app.use(express.json());
// To parse URL encoded data
app.use(express.urlencoded({ extended: false }));
app.use(
  expressSession({
    secret: "Tell nobody!",
    resave: false, //erases data after a session ends
    saveUninitialized: false, //doesn't save uninitialised sessions
  }),
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// passport configurations
passport.use(Signup.createStrategy());
passport.serializeUser(Signup.serializeUser());
passport.deserializeUser(Signup.deserializeUser());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success");
  res.locals.error_msg = req.flash("error");
  next();
});

// global variable to make the logged in user available to all pug files
app.use((req, res, next) => {
  res.locals.user = req.user || null; //stands for currently logged in user
  next();
});

// ROUTES
app.use("/", require("./routes/indexRoutes"));


app.use((req, res) => {
  res.status(404).send("Oops! Route not found.");
});

// BOOTSTRAPPING SERVER
app.listen(port, () => console.log(`listening on port ${port}`));
