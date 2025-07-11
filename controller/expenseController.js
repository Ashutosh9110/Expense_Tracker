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
  let t;
  try {
    t = await sequelize.transaction();
    const id = req.params.id;

    // Step 1: Find the expense (get its amount and userId)
    const expense = await expenses.findOne({ where: { id }, transaction: t });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({ msg: "Expense not found" });
    }

    const { expenseAmount, userId } = expense;

    // Step 2: Delete the expense
    await expenses.destroy({ where: { id }, transaction: t });

    // Step 3: Decrement user's totalExpenses
    await users.decrement("totalExpenses", {
      by: expenseAmount,
      where: { id: userId },
      transaction: t,
    });

    await t.commit();
    res.status(200).json({ msg: "Expense deleted" });
  } catch (error) {
    if (t) await t.rollback();
    res.status(500).json({ msg: "Unable to delete expense", error: error.message });
  }
};


const downloadExpense = async (req, res) => {
  try {
    const userId = req.userId;
    const expenseList = await expenses.findAll({ where: { userId } });

    let csvData  = "Description,Amount,Category,Note\n";
    expenseList.forEach(exp => {
      csvData  += `${exp.description},${exp.expenseAmount},${exp.category},${exp.note || ''}\n`;
    });

  //   const filename = `Expense-${userId}-${Date.now()}.csv`;
  //   const fileURL = await uploadToS3(csvData, filename);
    
  //   res.status(200).json({ fileURL });
  // } catch (err) {
  //   res.status(500).json({ msg: "Failed to generate report", error: err.message });
  // }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=expense-report.csv");
  res.status(200).send(csvData);
} catch (err) {
  res.status(500).json({ msg: "Failed to generate CSV", error: err.message });
}
}


const editExpense = async (req, res) => {
  let t;
  try {
    const { id } = req.params;
    const { description, expenseAmount, category, note } = req.body;
    const userId = req.userId;

    t = await sequelize.transaction();

    const existingExpense = await expenses.findOne({ where: { id, userId }, transaction: t });

    if (!existingExpense) {
      await t.rollback();
      return res.status(404).json({ msg: "Expense not found" });
    }

    const difference = expenseAmount - existingExpense.expenseAmount;

    await existingExpense.update(
      { description, expenseAmount, category, note },
      { transaction: t }
    );

    await users.increment("totalExpenses", {
      by: difference,
      where: { id: userId },
      transaction: t,
    });

    await t.commit();
    res.status(200).json({ msg: "Expense updated successfully" });
  } catch (error) {
    if (t) await t.rollback();
    res.status(500).json({ msg: "Failed to update expense", error: error.message });
  }
};





module.exports = {
  addExpense,
  getExpense,
  deleteExpense,
  downloadExpense,
  editExpense
}