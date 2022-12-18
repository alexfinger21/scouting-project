const dataCollectionPath = "/data-collection"
const loginPath = "/login"

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

export {clamp, dataCollectionPath, loginPath, selectRandom, getColor}