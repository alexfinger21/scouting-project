const Team = require("./team.js")

// teams: {1: Team, 2: Team, 3: Team}

module.exports = class Alliance {
    constructor(teams) {
        this.teams = teams
    }

    static getWeights(comp, src) {
        const [compAvg, srcAvg] = [comp.getAverage(), src.getAverage()]
        const weights = {}

        let maxW = 0

        for (const x of Object.keys(compAvg)) {
            weights[x] = (compAvg[x]/srcAvg[x])

            if (weights[x] == Infinity) {
                weights[x] = 1
            }
            maxW = Math.max(maxW, weights[x])
        }

        // normalize

        for (const x of Object.keys(weights)) {
            weights[x] = weights[x]/maxW
        }

        return weights
    }

    getAverage() {
        const res = {}
        const tlen = Object.values(this.teams).filter(t => t).length

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
