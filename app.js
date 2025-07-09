require("dotenv").config()
const path = require("path")
const fs = require("fs")

const express = require("express")
const cors = require("cors")
const app = express()
const userRouter = require("./routes/userRoutes")
const expenseRouter = require("./routes/expenseRoutes")
const paymentRouter = require("./routes/paymentRoutes")
const premiumRouter = require("./routes/premiumRoutes")
const resetPasswordRouter = require("./routes/resetPasswordRoutes")
const {sequelize} = require("./utils/db-connection")
const morgan = require("morgan")

app.use(cors())   

app.use(express.json())
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))
app.use("/users", userRouter)
app.use("/expenses", expenseRouter)
app.use("/payments", paymentRouter)
app.use("/premium", premiumRouter)
app.use("/password", resetPasswordRouter)

const logStream = fs.createWriteStream(path.join(__dirname, "access.log"), {flags: "a"})

app.use(morgan("combined", { stream: logStream}))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.get("/frontend", (req, res) => {
  res.sendFile(__dirname + "/public/frontend.html");
});

app.use((req, res) => {
  console.log("Request has arrived and is about to complete II");
  res.sendFile(path.join(__dirname, `public/${req.url}`))
})


sequelize.sync().then(() => {
  app.listen(process.env.PORT || 3000)
}).catch((err) => {
  console.log(err);
})


