const express = require("express");
const { signUp } = require("../controllers/auth/signup.controller");
const { signIn } = require("../controllers/auth/signin.controller");
const { logOut } = require("../controllers/auth/logout.controller");
const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/logout", logOut);

module.exports = router;
