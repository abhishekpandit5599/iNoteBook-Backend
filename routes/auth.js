const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const fetchUser = require("../middleware/fetchUser");
const jwt = require("jsonwebtoken");

const JWT_SECERT = "Abhishekpandit";

// Route 1 : Create a User using : POST "/api/auth/createuser"
let success = true;
router.post(
  "/createuser",
  [
    body("name").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success: false, errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({success:false, error: "Sorry a user with this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      //  Create a new User
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECERT);
      res.json({ success,authtoken });
    } catch (error) {
      console.log(error);
      res.status(500).json({success: false, error:"Some Error occured"});
    }
  }
);

// Route 2 : Create a User using : POST "/api/auth/login". No Login required
router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false,errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({success: false, error: "Please try to login with correct credentials" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({success: false, error: "Please try to login with correct credentials" });
      }

      data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECERT);
      res.json({success, authtoken });
    } catch (error) {
      console.log(error);
      res.status(500).json({success: false, error:"Some Error occured"});
    }
  }
);

// Route 3 : Get loggedin User Details using : POST "/api/auth/getuser". Login required
router.post("/getuser",fetchUser,async (req, res) => {
    try {
      userId = req.user.id;
      let user = await User.findById(userId).select('-password');
      res.send(user);
    } catch (error) {
      console.log(error);
      res.status(500).json({success: false, error:"Some Error occured"});
    }
  })

module.exports = router;
