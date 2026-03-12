let YEAR = 2026
let COMP = "mnwi"
let GAME_TYPE = "Q"
let gameStart = new Date("April 16, 2025")
let gameEnd = new Date("December 22, 2025")
const sch_constants =
    [
        [1, 8, '2026-03-06', '08:55:00', 9*60000],
        [9, 22, '2026-03-06', '10:06:00', 8*60000],
        [23, 55, '2026-03-06', '13:00:00', 8*60000],
        [56, 76, '2026-03-07', '08:55:00', 8*60000],
    ]

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
