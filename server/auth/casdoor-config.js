const casdoorConfig  = {
    serverUrl: "https://sso.team695.com",
    clientId: "" || process.env.CASDOOR_CLIENT_ID,
    appName: "695_scoutify_webapp",
    organizationName: "Team695",
    redirectPath: "/callback",
    signinPath: "/api/signin",
    endpoint: process.env.CASDOOR_ENDPOINT || "https://sso.team695.com",
    clientSecret: process.env.CASDOOR_CLIENT_SECRET || "",
    certificate: process.env.CASDOOR_CERTIFICATE || "",
    orgName: process.env.CASDOOR_ORG_NAME || "Team695",
}

// JWT Configuration
export const jwtOptions = {
    issuer: process.env.JWT_ISSUER || casdoorConfig.endpoint,
    audience: process.env.JWT_AUDIENCE || casdoorConfig.clientId,
}

