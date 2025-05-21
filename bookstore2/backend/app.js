const express = require("express")
const app = express()
const path = require("path")
const hbs = require("hbs")
const bodyParser = require("body-parser")
const cookieParser = require('cookie-parser');
app.use(cookieParser());
require("dotenv").config()
require("./conn/conn")

// Define views_path BEFORE using it
const views_path = path.join(__dirname, "../frontend/views")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())

// Set view engine
app.set("view engine", "hbs")
app.set("views", views_path)

// Routes
app.get("/", (req, res) => {
  res.render("index")
})
app.get("/index", (req, res) => {
  res.render("index")
})
app.get("/register", (req, res) => {
  res.render("register")
})
app.get("/Sign-in", (req, res) => {
  res.render("sign-in")
})
app.get("/sign-in", (req, res) => {
  res.render("sign-in")
})
app.get("/admin", (req, res) => {
  res.render("admin") // renders views/admin.hbs
})
app.get("/user", (req, res) => {
  res.render("user") // renders views/user.hbs
})
app.get("/place-order", (req, res) => {
  res.render("place-order") // renders views/placeorder.hbs
})

// Import routes
const Medicine = require("./routs/medicine")
const User = require("./routs/user")
const Order = require("./routs/order")

// Use routes with the correct API prefix
app.use("/api/user", User)
app.use("/api/medicine", Medicine)
app.use("/api/order", Order)

// Start server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server STARTED at port ${process.env.PORT || 3000}`)
})
