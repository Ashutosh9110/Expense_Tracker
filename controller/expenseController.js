const { uploadToS3 } = require("../services/s3service");
const {sequelize} = require("../utils/db-connection")
const {expenses} = require("../models/expenseModel")
const { users } = require("../models/userModel");
// const AWS = require("aws-sdk")

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


const downloadExpense = async (req, res) => {
  try {
    const userId = req.userId;
    const expenseList = await expenses.findAll({ where: { userId } });

    let data = "Description,Amount,Category,Note\n";
    expenseList.forEach(exp => {
      data += `${exp.description},${exp.expenseAmount},${exp.category},${exp.note || ''}\n`;
    });

    const filename = `Expense-${userId}-${Date.now()}.csv`;
    const fileURL = await uploadToS3(data, filename);
    
    res.status(200).json({ fileURL });
  } catch (err) {
    res.status(500).json({ msg: "Failed to generate report", error: err.message });
  }

      // const expenses = await req.user.getExpense()
      // console.log(getExpense);
      // const stringifiedExpenses = JSON.stringify(expenses)
      // const filename = "expense.txt"
      // const fileUrl = uploadToS3(stringifiedExpenses, filename)
      // res.status(200).json({ fileUrl, success: true})



}

module.exports = {
  addExpense,
  getExpense,
  deleteExpense,
  downloadExpense
}