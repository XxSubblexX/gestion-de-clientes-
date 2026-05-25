import express from "express"
import bcrypt from "bcryptjs"
import { PORT } from "./config.js" 
import userRoutes from "./routes/user.routes.js"
import { client } from "./db.js"

const app = express()
app.use (express.json())
app.use(userRoutes)
app.listen(PORT)
console.log("conectado", PORT)