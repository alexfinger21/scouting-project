let currentPage = "match-listing"

const paths = {
    dataCollection: "/data-collection",
    login: "/login",
    matchListing: "/match-listing",
    adminPage: "/admin-page"
}

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

function arrHasDuplicates(arr) {
    for(let i = 0; i < arr.length-1; i++) {
        for(let j = i+1; j < arr.length; j++) {
            if(arr[i] == arr[j]) {
                return true
            }
        }
    }
    return false
}

async function requestPage(url, data, ) {
    currentPage = url.substring(1)
    console.log(currentPage)
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

export {currentPage, clamp, selectRandom, getColor, requestPage, paths, arrHasDuplicates}