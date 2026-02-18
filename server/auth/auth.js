import { SDK } from "casdoor-nodejs-sdk"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()

export const config = {
    endpoint: "https://sso.team695.com",
    clientId: "8f4953fcb962d4f7c823",
    clientSecret: process.env.CASDOOR_SECRET,
    certificate: fs.readFileSync("./server/certs/casdoor.pem"),
    orgName: "Team695",
    appName: "695_scoutify_webapp",
}

const casdoorSdk = new SDK(config)
export default casdoorSdk
