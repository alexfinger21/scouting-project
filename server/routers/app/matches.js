import express from "express"
import database from "../../database/database.js"
import {consoleLog} from "../../utility.js"
import dotenv from "dotenv"

const router = express.Router()

dotenv.config()

router.get("/", async function(req, res) {
	const [err, matches] = await database.query(database.getAppMatches())
	if(err) {
		return next(err)
	}
	return res.status(200).send(JSON.stringify(matches))
})

export default router
