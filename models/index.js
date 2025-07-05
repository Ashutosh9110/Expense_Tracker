
const { users } = require("./userModel")
const { expenses } = require("./expenseModel")
const { forgotPasswordRequest } = require("./ForgotPasswordModel")


users.hasMany(expenses, {foreignKey: "userId", onDelete: "CASCADE"})
expenses.belongsTo(users, {foreignKey: "userId"})


// forgotPasswordRequest.hasMany("users", {foreignKey: "userId", onDelete: "CASCADE"})
// users.belongsTo(forgotPasswordRequest, { foreignKey: "userId"})

forgotPasswordRequest.belongsTo(users, { foreignKey: "userId" });
users.hasMany(forgotPasswordRequest);

module.exports = {
  users,
  expenses,
  forgotPasswordRequest
}