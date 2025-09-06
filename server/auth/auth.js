const { SDK } = require("casdoor-nodejs-sdk")

const sdkConfig  = {
    serverUrl: "https://sso.team695.com",
    clientId: "8f4953fcb962d4f7c823",
    appName: "695_scoutify_webapp",
    organizationName: "Team695",
    redirectPath: "/callback",
    signinPath: "/api/signin",
}
const sdk = new SDK(sdkConfig)

module.exports = { sdk }
