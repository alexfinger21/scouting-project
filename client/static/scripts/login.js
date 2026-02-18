import casdoorSdk from "./casdoor-config.js"
import { paths } from "./utility.js"

window.addEventListener("load", () => {
    if (!window.location.search?.length) {
        //window.location.href = casdoorSdk.getSigninUrl() 
    } else {
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: paths.login,
            data: JSON.stringify({
                code: window.location.search.length > 6 ? window.location.search.slice(6, window.location.search.indexOf("&")) : null
            }),
            success: function (response) {
                window.location.href = "/"
            },

            error: function (jqXHR, textStatus, errorThrown) {
                //consoleLog("Error\n" + errorThrown, jqXHR)
            }
        })
    }
})
