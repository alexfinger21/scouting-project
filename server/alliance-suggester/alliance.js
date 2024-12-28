const { consoleLog } = require("../utility.js")
const Team = require("./team.js")
const ignoredParams = [
  "frc_season_master_sm_year",
  "team_master_tm_number",
  "nbr_games"
]

module.exports = class Alliance {
    constructor(teams) {
        this.teams = teams
    }

    static getWeights(comp, src) {
        // basically if src is an array of alliances average them all out otherwise only do one
        const [compAvg, srcAvg] = [comp.getAverage(), src.length ? src.reduce((a, c) => c.getAverage(a), src[0]) : src.getAverage()]
        const weights = {}

        let maxW = 0

        for (const x of Object.keys(compAvg)) {
            if (!isNaN(compAvg[x]) && !ignoredParams.includes(x)) {
                weights[x] = (compAvg[x]/srcAvg[x])

                if (weights[x] == Infinity) {
                    weights[x] = 1
                } else if (isNaN(weights[x])) {
                    weights[x] = 0
                }

                maxW = Math.max(maxW, weights[x])
            }
        }
        //consoleLog("MAX WEIGHT", maxW)

        // normalize

        for (const x of Object.keys(weights)) {
            weights[x] = Math.round(weights[x]/maxW*1000) / 1000
        }

        return weights
    }

    getAverage() {
        const res = {}
        const tlen = this.teams.filter(t => t).length

        for (const t of Object.values(this.teams)) {
            if (t && t.props) {
                for (const p of Object.keys(t.props)) {
                    if (!res[p]) {
                        res[p] = t.props[p]/tlen
                    } else {
                        res[p] += t.props[p]/tlen
                    }
                }
            }
        }

        return res
    } 

    getAverage(comp) {
        const res = {}

        //if comp is a dict of alliance vals and not an alliance object itself
        const [avgCur, avgComp] = [this.getAverage(), comp.teams ? comp.getAverage() : comp]

        for (const p of Object.keys(avgCur)) {
            res = (avgCur[p] + avgComp[p])/2
        }

        return res
    }

}
