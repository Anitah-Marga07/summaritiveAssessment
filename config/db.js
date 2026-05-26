const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE);
    console.log("Yaaassss baiby! Mongoose at your service😘");
  } catch (error) {
    console.error(`Connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
