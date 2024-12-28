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
        const [compAvg, srcAvg] = [comp.getAverage(), src.getAverage()]
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
}
