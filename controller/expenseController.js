


const {expenses} = require("../models/expenseModel")
const { users } = require("../models/userModel")


const addExpense = async (req, res) => {
  
  try {
    const { description, expenseAmount, category } = req.body
    const userId = req.userId

    const expense = await expenses.create({
      description, expenseAmount, category, userId 
    })
    res.status(200).json(expense)
  } catch (error) {
    res.status(500).json({ msg : "Unable to add expense", error: error.message})
  }
}


const getExpense = async (req, res) => {
  try {
    const userId = req.userId
    const expense = await expenses.findAll({ where: { userId }})
      res.status(200).json(expense)
  } catch (error) {
    res.status(500).json({ msg : "Unable to fetch expenses", error: error.message})

  }
}


const deleteExpense = async (req, res) => {
  try {
    const id = req.params.id
    const expense = await expenses.destroy({ where : {id}})
    res.status(200).json({ msg : "Expense deleted"})
  } catch (error) {
    res.status(500).json({ msg : "Unable to delete expense", error: error.message})
  }
}



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

    res.status(200).json(formatted)
  } catch (error) {
    res.status(500).json({ msg: "Failed to load leaderboard", error: error.message })
  }
}


module.exports = {
  addExpense,
  getExpense,
  deleteExpense,
  leaderboard
}