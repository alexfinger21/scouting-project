const YEAR = 2025
const COMP = "joh"
const GAME_TYPE = "Q"
const gameStart = new Date("April 17, 2025")
const gameEnd = new Date("April 19, 2025")
const sch_constants =
    [[1, 30, '2025-04-17', '08:15:00', 480000],
     [31, 62, '2025-04-17', '13:50:00', 480000],
     [63, 88, '2025-04-18', '07:55:00', 480000],
     [89, 125, '2025-04-18', '13:05:00', 480000],]

//

module.exports = {
    YEAR: YEAR,
    COMP: COMP,
    GAME_TYPE: GAME_TYPE,
    gameStart: gameStart,
    gameEnd: gameEnd,
    sch_constants: sch_constants
}
