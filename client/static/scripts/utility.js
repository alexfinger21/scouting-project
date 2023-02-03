const paths = {
    dataCollection: "/data-collection",
    login: "/login",
    matchListing: "/match-listing"
}

const socket = io.connect(`${window.location.hostname}:5000`, {
    forceNew: true,
    transports: ["polling"],
})


const clamp = (num, min, max) => Math.min(Math.max(min, num), max)

//selects a random value from an array
function selectRandom(obj)
{
    let num =  obj[Math.round(Math.random() * (obj.length - 1))]
    return num
}

//returns the rgb value given a color
function getColor(color)
{
    if(color == "red")
    {
        return "rgb(255,0,0)"
    }
    else if(color == "yellow")
    {
        return "rgb(255,245,0)"
    }
    else
    {
        return "rgb(0,255,0)"
    }
}


async function requestPage(url, data, ) {
    $.ajax({
        type: "GET",
        contentType: "application/json",   
        url: url,
        data: JSON.stringify(data),
        success: function(response) {
            
            let temp

            $(response).each(function() {
               if ($(this).attr('id') == "page-holder") {
                temp = $(this)
               }
            })
            console.log(temp)

            document.body.removeChild(document.getElementById("page-holder"))

            $("body").append(temp)
        },

        error: function(jqXHR, textStatus, errorThrown)
        {
            console.log("Error\n" + errorThrown, jqXHR)
        },
    })
}

export {socket, clamp, selectRandom, getColor, requestPage, paths}