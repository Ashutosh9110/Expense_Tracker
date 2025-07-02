const { sequelize } = require("../utils/db-connection");

const {expenses} = require("../models/expenseModel")
const { users } = require("../models/userModel")

const leaderboard = async (req, res) => {
  try {
    const leaderboard = await expenses.findAll({
      attributes: [
        "userId",
        [sequelize.fn("SUM", sequelize.col("expenseAmount")), "totalExpense"]
      ],
      include: {
        model: users,
        attributes: ["name"]
      },
      group: ["userId"],
      order: [[sequelize.literal("totalExpense"), "DESC"]]
    })

    const formatted = leaderboard.map(entry => ({
      name: entry.user.name,
      totalExpense: entry.dataValues.totalExpense
    }))
    console.log("Leaderboard Data:", formatted);

    res.status(200).json(formatted)
  } catch (error) {
    res.status(500).json({ msg: "Failed to load leaderboard", error: error.message })
  }
}


module.exports = {

  leaderboard
}