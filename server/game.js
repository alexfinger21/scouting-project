const YEAR = 2024
const COMP = "ohcl"
const GAME_TYPE = "Q"
const gameStart = new Date("Octoer 20, 2024")
const gameEnd = new Date("October 30, 2024")
const sch_constants =
    [[1, 9, '2024-03-22', '09:00:00', 600000],
    [10, 21, '2024-03-22', '10:28:00', 480000], 
    [22, 57, '2024-03-22', '13:00:00', 480000], 
    [58, 80, '2024-03-23', '09:00:00', 480000]]

//

module.exports = {
    YEAR: YEAR,
    COMP: COMP,
    GAME_TYPE: GAME_TYPE,
    gameStart: gameStart,
    gameEnd: gameEnd,
    sch_constants: sch_constants
}
