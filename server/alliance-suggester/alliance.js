const Team = require("./team.js")

module.exports = class Alliance {
    constructor(teams) {
        this.teams = teams
    }

    static getWeights(comp, src) {

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
