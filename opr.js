const API_KEY = 'H7PKbcEB2e8AKNJC0czYo8sh3eK36OPu7EmkuMxQjc2XKlHx4CNrGN4ctzPjGU6Y';
const EVENT_KEY = '2026week0';

const getTowerPts = (s, a) => s === "Level1" ? (a ? 15 : 10) : (s === "Level2" ? 20 : (s === "Level3" ? 30 : 0));

// NEW: Simplified OPR - Divides alliance score by 3
function calculateSimplifiedOPR(teamList, matchRecords) {
    let totals = {}, counts = {};
    teamList.forEach(t => { totals[t] = 5.0; counts[t] = 1; }); // Baseline to avoid 0

    matchRecords.forEach(m => {
        const share = (m.ah + m.ap + m.ep + m.shTotal) / 3;
        m.teams.forEach(t => {
            if (totals[t] !== undefined) {
                totals[t] += share;
                counts[t]++;
            }
        });
    });

    let oprs = {};
    teamList.forEach(t => { oprs[t] = (totals[t] / counts[t]).toFixed(2); });
    return oprs;
}

function getMatchData(m, col) {
    const brk = m.score_breakdown || {}, d = brk[col] || {}, opp = brk[col === 'red' ? 'blue' : 'red'] || {};
    const h = d.hubScore || {}, oh = opp.hubScore || {};
    const teamKeys = m.alliances[col].team_keys.map(t => t.substring(3));
    
    const aT = [1,2,3].map(i => d[`autoTowerRobot${i}`] || 'None');
    const eT = [1,2,3].map(i => d[`endGameTowerRobot${i}`] || 'None');
    const aP = aT.reduce((sum, s) => sum + getTowerPts(s, true), 0);
    const eP = eT.reduce((sum, s) => sum + getTowerPts(s, false), 0);
    const shTotal = [1,2,3,4].reduce((sum, i) => sum + (h[`shift${i}Count`] || 0), 0);
    const short = (s) => s.includes('Level') ? s.replace('Level', 'L') : 'N';

    return {
        teams: teamKeys,
        tStr: teamKeys.join(","),
        ah: h.autoPoints || 0,
        af: (h.autoPoints || 0) > (oh.autoPoints || 0) ? "F" : "T", 
        ac: aT.map(short).join(""),
        ap: aP,
        s: [1,2,3,4].map(i => h[`shift${i}Count`] || 0),
        shTotal: shTotal,
        ec: eT.map(short).join(""),
        ep: eP,
        f: d.foulPoints || 0,
        tot: m.alliances[col].score || 0
    };
}

async function run() {
    try {
        const res = await fetch(`https://www.thebluealliance.com/api/v3/event/${EVENT_KEY}/matches`, { headers: { 'X-TBA-Auth-Key': API_KEY } });
        if (!res.ok) return;
        const matches = await res.json();
        
        const w = { "qm": 1000, "sf": 2000, "f": 3000 };
        matches.sort((a, b) => (w[a.comp_level] + a.match_number) - (w[b.comp_level] + b.match_number));

        let allMatchRecords = [];
        let teamSet = new Set();

        console.log(`\n--- MATCH TRACKER ---`);
        const h = (s, p) => s.toString().padEnd(p);
        console.log(`${h('M', 5)}|${h('TEAMS', 14)}|AH|AF|AC |AP|S1|S2|S3|S4|EC |EP|F |TOT`);

        matches.forEach(m => {
            ['red', 'blue'].forEach(color => {
                const d = getMatchData(m, color);
                d.teams.forEach(t => teamSet.add(t));
                allMatchRecords.push(d);
                
                // Print table row
                const row = `${h(m.comp_level.toUpperCase()+m.match_number, 5)}|${h(d.tStr, 14)}|${h(d.ah, 2)}|${h(d.af, 2)}|${h(d.ac, 3)}|${h(d.ap, 2)}|${h(d.s[0], 2)}|${h(d.s[1], 2)}|${h(d.s[2], 2)}|${h(d.s[3], 2)}|${h(d.ec, 3)}|${h(d.ep, 2)}|${h(d.f, 2)}|${h(d.tot, 3)}`;
                if(color === 'red') console.log(row); // Print red, blue matches as they come
            });
        });

        // Calculate and Print OPR
        const teamList = Array.from(teamSet).sort((a, b) => a - b);
        const oprs = calculateSimplifiedOPR(teamList, allMatchRecords);

        console.log(`\n--- TEAM OPR RANKINGS (Shared Score) ---`);
        teamList.forEach(t => {
            console.log(`Team ${t.padEnd(5)}: ${oprs[t]}`);
        });

    } catch (e) { console.error("Error:", e.message); }
}

run();
