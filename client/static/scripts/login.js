const loginPath = "/login"

window.addEventListener("load", function() {
    console.log(document.getElementsByClassName("centerform")[0])
    const form = document.getElementsByClassName("centerform")[0]

    form.onsubmit = (event) => {
        event.preventDefault()

        const children = form.children[0].children
        
        let tempChildArr = []

        for (const child of children) {
            if (child.children.length != 0) { 
                tempChildArr.push(child.children[1])
            }
        }

        const data = {}

        tempChildArr.forEach((child) => {
            data[child.name] = child.value
        })

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