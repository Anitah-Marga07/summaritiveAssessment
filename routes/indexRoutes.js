const express = require("express");
const router = express.Router();
const passport = require("passport");
const multer = require("multer");

const Signup = require("../models/Signup");
const Product = require("../models/Product");

// image configurations
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// sign up routes
router.get("/", (req, res) => {
  res.render("signup");
});

router.post("/", async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, confirmPassword } =
      req.body;

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match!");
      return res.redirect("/");
    }

    let existingUser = await Signup.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      req.flash("error", "Email is already registered!");
      return res.redirect("/");
    }
    //create new user
    const newUser = new Signup({
      fullName,
      email: email.toLowerCase(),
      phoneNumber,
    });
    console.log(newUser);

    await Signup.register(newUser, req.body.password);
    req.flash("success", "Account created successfully!");
    return res.redirect("/");
  } catch (error) {
    console.error("Signup error:", error);
    req.flash("error", "User creation failed: " + error.message);
    res.redirect("/");
  }
});

// login routes
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);

      req.flash("success", "Welcome back!");
      return res.redirect("/congs");
    });
  })(req, res, next);
});

// congs page route
router.get("/congs", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  res.render("congs");
});

// dashboard routes
router.get("/products", async (req, res) => {
  try {
    const allProducts = await Product.find({}).sort({ createdAt: -1 });
    const stockAgg = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: "$price" },
        },
      },
    ]);
    const calculatedStockValue = stockAgg.length > 0 ? stockAgg[0].totalValue : 0;
    const clacOutOfStockCount = await Product.countDocuments({ quantity: 0 });

    res.render("dashboard", {
      products: allProducts,
      stockValue: calculatedStockValue,
      outOfStockCount: clacOutOfStockCount,
    });
  } catch (error) {
    console.error("Error loading products:", error);
    req.flash("error", "Failed to load dashboard data.");
    res.render("dashboard", {
      products: [],
      stockValue: 0,
      outOfStockCount: 0,
    });
  }
});

router.post("/products", upload.single("productImage"), async (req, res) => {
  try {
    const { productName, category, unitPrice, quantity, color, productImage } =
      req.body;

    if (!productName || !category || !unitPrice || !quantity) {
      req.flash("error", "All fields except image are required!");
      return res.redirect("/products");
    }
    const price = parseInt(quantity, 10) * parseFloat(unitPrice);

    const newProduct = new Product({
      productName,
      category,
      unitPrice: parseFloat(unitPrice),
      quantity: parseInt(quantity, 10),
      price,
      color: color || "N/A",
      productImage: req.file ? req.file.path: "",
    });

    await newProduct.save();

    req.flash("success", "Product has been added successfully!");
    return res.redirect("/products");
  } catch (error) {
    console.error("Error saving product:", error);
    req.flash("error", "Server processing error: " + error.message);
    return res.redirect("/products");
  }
});

//this exposes the contents of this file to other files in the folder
module.exports = router;
