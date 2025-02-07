import { neon, neonConfig } from "@neondatabase/serverless"
import dotenv from "dotenv"

dotenv.config()

neonConfig.fetchConnectionCache = true

const sql = neon(process.env.DATABASE_URL!)

export default sql

