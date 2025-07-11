

const bcrypt = require("bcrypt")

const { users } = require("../models/userModel")
const jwt = require("jsonwebtoken")
const { jwtSecret } = require("../config")


const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const existingUser = await users.findOne({ where: { email }})
    if(existingUser) {
      return res.status(401).json({ msg : "User already exists. Please go to the login page"})
    }
  
    bcrypt.hash(password, 10, async (err, hash) => {
      await users.create({ name, email, password:hash})
      return res.status(201).json({ msg : `User with name ${name} has been created`})
    })
  } catch (error) {
    res.status(500).json({ msg : "Failed to signup the user"})
  }
}




const signIn = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await users.findOne({ where : {email}})
    if(!user) {
      return res.status(409).json({ msg : "User not found"})
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if(!isPasswordValid){
      return res.status(404).json({ msg : "Incorrect password"})
    }

    const token = jwt.sign({ userId: user.id}, jwtSecret, {expiresIn: "1h"})
    res.status(201).json({ msg : "User signed in", token})

  } catch (error) {
    res.status(500).json({ msg : "Failed to signin the user"})    
  }
}




module.exports = {
  signIn,
  signUp
}




















//   const signIn = async (req, res) => {
//       try {
//         const { email, password } = req.body

//       const user = await users.findOne({ where: {
//         email
//       }})
//       if(!user) {
//         res.status(404).json({ msg: "User not found. Please create a new account"})
//       }

//       const isPasswordValid = await bcrypt.compare(password, user.password);
//       if (!isPasswordValid) {
//         return res.status(401).json({ msg: "Incorrect password" });
//       }

//       const token = jwt.sign({ userId: user.id }, "secretKey", { expiresIn: "1h" });
//         res.status(200).json({ msg : "User logged in successfully", token })
//       } catch (error) {
//         res.status(500).json({ msg : "Failed to login the user",  error: error.message})
//       }
//   }


//   module.exports = {
//     signUp,
//     signIn
//   }