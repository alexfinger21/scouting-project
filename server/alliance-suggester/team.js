module.exports = class Team {
    constructor(props) {
        this.name = props.tm_name
        this.tm_num = props.team_master_tm_number
        this.props = props
        this.suggestions = []
    }

    static getAverage(...teams) {
        const res = {}
        teams = teams.filter(t => t)
        const tlen = teams.length

        for (const t of teams) {
            if (t && t.props) {
                for (const p of Object.keys(t.props)) {
                    if (!isNaN(t.props[p])) {
                        if (!res[p]) {
                            res[p] = t.props[p]/tlen
                        } else {
                            res[p] += t.props[p]/tlen
                        }
                    }
                }
            }
        }

        return res
    }

    getRank(comp, weights) {
        let res = 0 

        for (const i of Object.keys(comp)) {
            if (weights?.[i]) {
                const addR = this.props[i]/comp[i] * weights[i]
                if (isNaN(addR)) {
                    res += this.props[i] ? (this.props[i] * weights[i]) : 0
                } else {
                    res += addR
                }

                if (this.props[i]/comp[i] > 1) {
                    this.suggestions.push(`higher than average ${i}`)
                }
            }
        }

        return res
    }    
}
