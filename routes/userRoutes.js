const express = require("express")
const router = express.Router()
const userController  = require("../controller/userController")
const authenticate = require("../middleware/auth")

router.post("/signup", userController.signUp)
router.post("/signin", userController.signIn)
router.get("/status", authenticate, userController.getUserStatus);


module.exports = router