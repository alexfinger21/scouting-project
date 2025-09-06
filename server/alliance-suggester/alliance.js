import { consoleLog } from "../utility.js"
import Team from "./team.js"

const ignoredParams = [
  "frc_season_master_sm_year",
  "team_master_tm_number",
  "nbr_games",
  "tm_name",
]

const customWeights = {
    "total_game_score_avg":1.1
}

export default class Alliance {
    constructor(teams) {
        this.teams = teams
    }

    static getWeights(src, comp) {
        // basically if src is an array of alliances average them all out otherwise only do one
        consoleLog(src.length, src.length == null)
        const [srcAvg, compAvg] = [src.getAverage(), comp.length ? comp.reduce((a, c) => c.getAverage(a), comp[0]) : comp.getAverage()]
        const weights = {}
        consoleLog(srcAvg, compAvg)

        let maxW = 0

        for (const x of Object.keys(compAvg)) {
            if (!isNaN(compAvg[x]) && !ignoredParams.includes(x) && x.search("sum") == -1) {
                weights[x] = (compAvg[x]/srcAvg[x])

                if (weights[x] == Infinity) {
                    weights[x] = 1
                } else if (isNaN(weights[x])) {
                    weights[x] = 0
                }

                if (customWeights?.[x]) {
                    weights[x] *= customWeights[x]
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

    getAverage(comp = -1) {
        let res = {}
        if (comp == -1) {
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
        } else {
            //if comp is a dict of alliance vals and not an alliance object itself
            const [avgCur, avgComp] = [this.getAverage(), comp.teams ? comp.getAverage() : comp]
            consoleLog(avgCur, avgComp)

            for (const p of Object.keys(avgCur)) {
                res[p] = (avgCur[p] + avgComp[p])/2
            }

            return res
        }
    } 
}
