const express = require("express")
const router = express.Router()
const leaderboardController = require("../controller/leaderboardController")
const authenticate = require("../middleware/auth");


router.get("/leaderboard", authenticate, leaderboardController.leaderboard)


module.exports = router