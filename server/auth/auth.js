import { SDK } from "casdoor-nodejs-sdk"
import fs from "fs"

export const config = {
    endpoint: "https://sso.team695.com",
    clientId: "300932808273326bac0c",
    clientSecret: "b134d448a828a80685c4fd5d0b661cc41f1a841f",
    certificate: fs.readFileSync("./server/certs/casdoor.pem"),
    orgName: "Team695",
    appName: "695_scoutify_webapp",
}

const casdoorSDK = new SDK(config)
export default casdoorSDK
