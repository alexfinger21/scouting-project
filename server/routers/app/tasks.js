import database from "../../database/database.js"
import express from "express"
import { consoleLog, } from "../../utility.js"
import gameConstants from "../../game.js"
import SQL from "sql-template-strings"

const router = express.Router()


router.get("/", async function(req, res, next) {

	const userId = res.locals.authUserId
	if(!userId) {
		return next(new Error("User id not provided"))
	}

	const [err, tasks] = await database.query(database.getAppTasks(userId))
	if(err) {
		return next(err)
	}

	consoleLog(database.getAppTasks(userId))

	consoleLog(JSON.stringify(tasks))

	return res.status(200).send(JSON.stringify(tasks))
})

export default router
