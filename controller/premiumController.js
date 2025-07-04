const { sequelize } = require("../utils/db-connection");

const {expenses} = require("../models/expenseModel")
const { users } = require("../models/userModel")

const leaderboard = async (req, res) => {
  try {
    const leaderboard = await users.findAll({
      attributes: ["name", "totalExpenses"],
      order: [["totalExpenses", "DESC"]]
    })

    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ msg: "Failed to load leaderboard", error: error.message })
  }
}


module.exports = {

  leaderboard
}