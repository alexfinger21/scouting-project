import SDK from "https://esm.sh/casdoor-js-sdk"

export const config = {
    serverUrl: "https://sso.team695.com",
    clientId: "8f4953fcb962d4f7c823",
    appName: "695_scoutify_webapp",
    organizationName: "Team695",
    redirectPath: "/login", 
}

const casdoorSdk = new SDK(config)

export default casdoorSdk 
