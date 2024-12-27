module.exports = class Team {
    constructor(props) {
        this.name = props.tm_name
        this.props = props
        this.suggestions = {}
    }
}
