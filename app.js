require("dotenv").config()
const express = require("express")
const path = require("path")
const cors = require("cors")
const app = express()
const userRouter = require("./routes/userRoutes")
const expenseRouter = require("./routes/expenseRoutes")
const paymentRouter = require("./routes/paymentRoutes")

const {sequelize} = require("./utils/db-connection")

app.use(cors()) 
app.use(express.json())
app.use("/users", userRouter)
app.use("/expenses", expenseRouter)
app.use("/payments", paymentRouter)



app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})



sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log("Server running at PORT 3000");
  })
}).catch((err) => {
  console.log(err);
})


