const UNSUCCESSFUL_THRESHHOLD = 0.25
const SUCCESSFUL_THRESHHOLD = 4

const props = {
    total_game_score_avg: "total game score",
    auton_total_score_avg: "total auton score",
    auton_notes_amp_avg: "scoring auton amp",
    auton_notes_speaker_avg: "scoring auton speaker",
    auton_notes_pickup_avg: "total notes picked up in auton",
    teleop_total_score_avg: "total teleop score",
    teleop_notes_amp_avg: "total scored into app during teleop",
    teleop_notes_speaker_not_amped_avg: "teleop unamped speaker shots",
    teleop_notes_speaker_amped_avg: "teleop amped speaker shots",
    teleop_amp_button_press_avg: "total amp button presses",
    teleop_coop_button_press_avg: "total co-op button presses",
    teleop_notes_acquired_avg: "teleop note acquisition",
    endgame_notes_trap_avg: "trap notes",
    endgame_onstage_points_avg: "onstage points",
    endgame_high_notes_avg: "scoring high note",
    endgame_total_score_avg: "total endgame score",
}

module.exports = class Team {
    constructor(props) {
        this.name = props.tm_name
        this.tm_num = props.team_master_tm_number
        this.props = props
        this.suggestions = {
            best: "",
            successful: [],
            unsuccessful: []
        }
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
        let maxStat = -1

        for (const i of Object.keys(comp)) {
            if (weights?.[i]) {
                const addR = this.props[i]/comp[i] * weights[i]
                if (isNaN(addR)) {
                    res += this.props[i] ? (this.props[i] * weights[i]) : 0
                } else {
                    res += addR
                }

                if (this.props[i]/comp[i] > maxStat) {
                    this.suggestions.best = `best stat is ${props[i]}`
                    maxStat = this.props[i]/comp[i] 
                }
                if (this.props[i]/comp[i] <= UNSUCCESSFUL_THRESHHOLD) {
                    this.suggestions.unsuccessful.push(`unsuccessful at ${props[i]}`)
                }
                if (this.props[i]/comp[i] >= SUCCESSFUL_THRESHHOLD) {
                    this.suggestions.successful.push(`good at ${props[i]}`)
                }
            }
        }

        this.suggestions.unsuccessful.sort()
        this.suggestions.successful.sort()



        return res
    }    
}
