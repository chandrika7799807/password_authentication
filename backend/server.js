const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const cors = require("cors");
const User = require("./models/User");  // Only once

const app = express();

app.use(express.json());
app.use(cors());

// Connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/authdb")
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log(err));

// ================= REGISTER API =================
app.post("/register", async (req,res)=>{
  try{
    const { email, password } = req.body;

    const hash = await bcrypt.hash(password,10);

    const user = new User({
      email,
      password: hash
    });

    await user.save();

    res.json("Registered");

  }catch(err){
    console.log(err);
    res.status(500).json("Server error");
  }
});

// ================= LOGIN API =================
app.post("/login", async(req,res)=>{
  const { email,password,device } = req.body;

  const user = await User.findOne({email});
  if(!user) return res.json("User not found");

  const match = await bcrypt.compare(password,user.password);
  if(!match) return res.json("Wrong password");

  // First login
  if(!user.device){
    user.device = device;
    await user.save();
    return res.json("Device Registered. Login Success");
  }

  // Same device
  if(user.device === device){
    return res.json("Login Success");
  }

  // Different device
  res.json("New device detected. Access blocked");
});

// ================= SEND OTP API =================
app.post("/send-otp", async(req,res)=>{
  const otp = Math.floor(100000 + Math.random()*900000);

  await User.updateOne(
    { email: req.body.email },
    { $set: { otp: otp } }
  );

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "YOUR_EMAIL@gmail.com",
      pass: "APP_PASSWORD" // Use App Password
    }
  });

  await transporter.sendMail({
    to: req.body.email,
    subject: "Recovery OTP",
    text: "Your OTP is "+otp
  });

  res.json("OTP Sent");
});

// ================= VERIFY OTP + UPDATE DEVICE API =================
app.post("/verify-otp", async(req,res)=>{
  const user = await User.findOne({
    email: req.body.email,
    otp: req.body.otp
  });

  if(!user){
    return res.json("Invalid OTP");
  }

  await User.updateOne(
    { email: req.body.email },
    { $set: { device: req.body.device, otp: "" } } // Clear OTP after use
  );

  res.json("Device Updated Successfully");
});

// ================= START SERVER =================
app.listen(3000,"0.0.0.0",()=>{
  console.log("Server started");
});




