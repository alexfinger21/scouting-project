module.exports = class Team {
    constructor(props) {
        this.name = props.tm_name
        this.props = props
        this.suggestions = {}
    }

    static getAverage(...teams) {
        const res = {}
        const tlen = teams.filter(t => t).length

        for (const t of teams) {
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

    getRank(comp, weights) {
        let res = 0 

        for (const i of Object.keys(comp)) {
            res += this.props[i]/comp[i] * weights[i]
        }

        return res
    }    
}
