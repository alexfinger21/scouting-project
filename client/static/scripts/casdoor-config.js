import SDK from "https://esm.sh/casdoor-js-sdk"

export const config = {
    serverUrl: "https://sso.team695.com",
    clientId: "300932808273326bac0c",
    appName: "695_scoutify_webapp",
    organizationName: "Team695",
    redirectPath: "/login", 
}

const casdoorSDK = new SDK(config)

export default casdoorSDK 
