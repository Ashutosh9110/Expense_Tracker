

const {sequelize} = require("../utils/db-connection")
const {expenses} = require("../models/expenseModel")
const { users } = require("../models/userModel");


const addExpense = async (req, res) => {
  
  let t
  try {

    t = await sequelize.transaction()
    const { description, expenseAmount, category, note } = req.body
    const userId = req.userId

    await expenses.create({
      description, expenseAmount, category, note, userId 
    }, { transaction : t})


    await users.increment("totalExpenses", {
      by: expenseAmount,
      where: { id: userId },
      transaction: t
    });

    await t.commit()
    res.status(200).json({ msg: "Expense added successfully" })
  } catch (error) {
    if (t) await t.rollback();
    res.status(500).json({ msg : "Unable to add expense", error: error.message})
  }
}


const getExpense = async (req, res) => {
  try {
    const userId = req.userId
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit;

    const { count, rows } = await expenses.findAndCountAll({
      where: { userId },
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      totalItems: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      expenses: rows
    });
  } catch (error) {
    res.status(500).json({ msg: "Unable to fetch expenses", error: error.message });
  }
}


const deleteExpense = async (req, res) => {
  let t
  try {
    t = await sequelize.transaction()
    const id = req.params.id
    const expense = await expenses.destroy({ where : {id},
    transaction : t })
    await t.commit()
    res.status(200).json({ msg : "Expense deleted"})
  } catch (error) {
    if (t) await t.rollback()
    res.status(500).json({ msg : "Unable to delete expense", error: error.message})
  }
}




module.exports = {
  addExpense,
  getExpense,
  deleteExpense,
}