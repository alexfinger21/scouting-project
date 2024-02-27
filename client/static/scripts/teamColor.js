function HSLToRGB(h, s, l) //https://stackoverflow.com/a/64090995
{
    let a = s * Math.min(l, 1 - l);
    let f = n => {
        const k = (n + h / 30) % 12
        return Math.max(0, Math.min(255, Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)))));
    }
    return [f(0), f(8), f(4)];
}

function stringToRGB(color) {
    const arr = color.replace(/[^\d,.]/g, '').split(',')
    return [arr[0], arr[1], arr[2]]
}

function RGBToString([r, g, b]) {
    return `rgb(${r},${g},${b})`
}

function hexToRGB(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

function isSimilar([r1, g1, b1], [r2, g2, b2]) {
    return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) < 50;
}

function hasColor(color, arr) {
    for (const c of arr) {
        if (c && color && isSimilar(c, color)) {
            return true
        }
    }
    return false
}

function teamToHSL(team) {
    let hash = 0
    if (team.length === 0) return hash
    for (let i = 0; i < team.length; i++) {
        hash = team.charCodeAt(i) + ((hash << 5) - hash)
        hash = hash & hash
    }
    //console.log(team, "hue:", Math.abs(hash % 360))
    return Math.abs(hash % 360)
}

async function getTeamColor(team, teamName, existingColors) {
    return fetch(`https://api.frc-colors.com/v1/team/${team}`)
        .then(response => response.json())
        .then((data) => {
            if (data?.statusCode == 404) {
                throw new Error(`Team ${team} not found`)
            }
            //console.log("COLOR for", team, ":", data)
            if (!hasColor(hexToRGB(data.primaryHex), existingColors)) {
                return hexToRGB(data.primaryHex)
            }
            else if (hasColor(hexToRGB(data.secondaryHex), existingColors)) {
                return hexToRGB(data.secondaryHex)
            }
            else {
                throw new Error(`Colors are all used for team ${team}`)
            }
        })
        .catch((error) => { //team not found
            const hue = teamToHSL(teamName)
            if(!hasColor(HSLToRGB(hue, 0.8, 0.7), existingColors)) {
                return HSLToRGB(hue, 0.8, 0.7)
            }
            return HSLToRGB((hue + 37), 0.8, 0.7)
        })
}

function darkenRGB([r, g, b], level) {
    return [Math.round(r / level), Math.round(g / level), Math.round(b / level)]
}

function darkenRGBString(str, level) {
    return RGBToString(darkenRGB(stringToRGB(str), level))
}

/*test code

const existingColors = []
const teams = ["695", "695", "2399", "694", "28312"]

for (const team of teams) {
    getTeamColor(team, existingColors).then(color => {
        console.log(team, ":", color)
        existingColors.push(color)
    })
} */

export {getTeamColor, darkenRGBString}
