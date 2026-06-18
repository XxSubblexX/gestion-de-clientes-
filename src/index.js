import morgan from "morgan";
import express from "express"
import bcrypt from "bcryptjs"
import { PORT } from "./config.js" 
import userRoutes from "./routes/routes.js"
import dotenv from "dotenv";
import cors from "cors";

const app = express()

dotenv.config();

app.use(morgan("short"));
app.use(cors())
app.use (express.json())
app.use(userRoutes)
app.listen(PORT)

console.log("conectado", PORT)