import {loginPath} from "./utility.js"

const SHA256 = CryptoJS.SHA256

window.addEventListener("load", () => {
    ScreenOrientation.lock("portrait") //prevents turning the device
    console.log(document.getElementsByClassName("centerform")[0])
    const form = document.getElementsByClassName("centerform")[0]

    form.onsubmit = (event) => {
        event.preventDefault()

        const children = document.getElementsByClassName("login-input-container")
        
        let tempChildArr = []

        for (const child of children) {
            tempChildArr.push(child.children[1])
        }

        const data = {}

        tempChildArr.forEach((child) => {
            data[child.name] = child.value.length <= 30 ? child.value : child.value.substring(0, 30)
            console.log("original : " + child.value + "\n truncated: " + child.value.substring(0, 30))
        })

        for (const key in data) {
            const value = data[key]
            
            if (value == "") {
                return false;
            }
        }
        
        data.password = SHA256(data.password).toString(CryptoJS.enc.Hex)
        
        console.log(data)

        $.ajax({
            type: "POST",
            contentType: "application/json",   
            url: loginPath,
            data: JSON.stringify(data),
            success: function(response) {
                if (response.result == 'redirect') {
                    //redirect from the login to data collection if successful, otherwise refresh
                    window.location.replace(response.url);
                }
            },

            error: function(jqXHR, textStatus, errorThrown)
            {
                console.log("Error\n" + errorThrown, jqXHR)
            },
        })
        
     }
})