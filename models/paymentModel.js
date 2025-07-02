const { DataTypes } = require("sequelize")
const {sequelize} = require("../utils/db-connection")
  const Payment = sequelize.define("Payment", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    paymentSessionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    orderAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    orderCurrency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "INR",
    },

    paymentStatus: {
      type: DataTypes.ENUM("Pending", "Success", "Failure"),
      allowNull: false,
      defaultValue: "Pending",
    },

    customerId: {
      type: DataTypes.STRING,
      allowNull: true, 
    },

    customerPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });



  module.exports = { Payment }
