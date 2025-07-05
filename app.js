require("dotenv").config()
const express = require("express")
const path = require("path")
const cors = require("cors")
const app = express()
const userRouter = require("./routes/userRoutes")
const expenseRouter = require("./routes/expenseRoutes")
const paymentRouter = require("./routes/paymentRoutes")
const premiumRouter = require("./routes/premiumRoutes")
const resetPasswordRouter = require("./routes/resetPasswordRoutes")
const {sequelize} = require("./utils/db-connection")

app.use(cors()) 

app.use(express.json())
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))
app.use("/users", userRouter)
app.use("/expenses", expenseRouter)
app.use("/payments", paymentRouter)
app.use("/premium", premiumRouter)
app.use("/password", resetPasswordRouter)


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.get("/frontend", (req, res) => {
  res.sendFile(__dirname + "/public/frontend.html");
});


sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log("Server running at PORT 3000");
  })
}).catch((err) => {
  console.log(err);
})


