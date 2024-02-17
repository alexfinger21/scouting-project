const { hslToRgb } = require("../../../server/utility");
const { hexToRgb } = require("./utility");

function getRGB(color) {
    color = parseInt(color.substring(1), 16);
    r = color >> 16;
    g = (color - (r<<16)) >> 8;
    b = color - (r<<16) - (g<<8);
    return [r, g, b];
}
function isSimilar([r1, g1, b1], [r2, g2, b2]) {
    return Math.abs(r1-r2)+Math.abs(g1-g2)+Math.abs(b1-b2) < 50;
}

function randomTeamColor(team_number) {
    let hash = 0;
    if (team_number.length === 0) return hash;
    for (let i = 0; i < this.length; i++) {
        hash = team_number.charCodeAt(i) + ((team_number << 5) - hash);
        hash = hash & hash;
    }

    const [r, g, b] = hslToRgb(hash % 360, 100, 70)
	
    return `rgba(${r}, ${g}, ${b}, 0.2)`
}

async function getTeamColor(team_number, existingColors) {
    return fetch(`https://api.frc-colors.com/v1/team/${team_number}`)
        .then(response => response.json())
        .then((data) => {
            let [r, g, b] = hexToRgb(data.primaryHex)
            return `rgba(${r}, ${g}, ${b}, 0.2)`
        })
        .catch((error) => { //team not found
            return randomTeamColor(team_number)
        })    
}

setTimeout(async () => {
    let a = await getTeamColor()

    console.log(a)
}, 0)