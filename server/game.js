let YEAR = 2026
let COMP = "mnwi"
let GAME_TYPE = "Q"
let gameStart = new Date("April 16, 2025")
let gameEnd = new Date("December 22, 2027")

const sch_constants =
    [[1, 30, '2025-04-17', '08:15:00', 480000],
     [31, 62, '2025-04-17', '13:50:00', 480000],
     [63, 88, '2025-04-18', '07:55:00', 480000],
     [89, 125, '2025-04-18', '13:05:00', 480000],]

const gameConsts = {
    YEAR: YEAR,
    COMP: COMP,
    GAME_TYPE: GAME_TYPE,
    gameStart: gameStart,
    gameEnd: gameEnd,
    updateConstants: updateConstants
}

function updateConstants(year, comp, gameType) {
    gameConsts.YEAR = year
    gameConsts.COMP = comp
    gameConsts.GAME_TYPE = gameType
}


export default gameConsts
