const express = require("express")
const router = express.Router()
const premiumController = require("../controller/premiumController")
const authenticate = require("../middleware/auth");



router.get("/leaderboard", authenticate, premiumController.leaderboard)



module.exports = router