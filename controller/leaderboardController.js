const { sequelize } = require("../utils/db-connection");

const {expenses} = require("../models/expenseModel")
const { users } = require("../models/userModel")

const leaderboard = async (req, res) => {
  try {
    const leaderboard = await expenses.findAll({
      attributes: [
        "userId",
        [sequelize.fn("SUM", sequelize.col("expenseAmount")), "totalExpenses"]
      ],
      include: {
        model: users,
        as: "user",
        attributes: ["name"]
      },
      group: ["userId"],
      order: [[sequelize.fn("SUM", sequelize.col("expenseAmount")), "DESC"]]
    });

    const formatted = leaderboard.map(entry => ({
      name: entry.user.name,
      totalExpenses: entry.get("totalExpenses")
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ msg: "Failed to load leaderboard", error: error.message });
  }
};

module.exports = {

  leaderboard
}