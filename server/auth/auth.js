import { SDK } from "casdoor-nodejs-sdk"
import fs from "fs"

export const config = {
    endpoint: "https://sso.team695.com",
    clientId: "8f4953fcb962d4f7c823",
    clientSecret: "e46dcd59cfb85d1a5d899aece0c5f844816019f4",
    certificate: fs.readFileSync("./server/certs/casdoor.pem"),
    orgName: "Team695",
    appName: "695_scoutify_webapp",
}

const casdoorSdk = new SDK(config)
export default casdoorSdk
