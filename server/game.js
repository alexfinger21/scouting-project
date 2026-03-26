let YEAR = 2026
let COMP = "ohcl"
let GAME_TYPE = "Q"
let gameStart = new Date("April 16, 2025")
let gameEnd = new Date("December 22, 2027")

const sch_constants =
    [
        [1, 8, '2026-03-20', '08:50:00', 9*60000],
        [9, 10, '2026-03-20', '10:01:00', 9*60000],
        [11, 12, '2026-03-20', '10:18:00', 9*60000], 
        [13, 14, '2026-03-20', '10:35:00', 9*60000],
        [15, 16, '2026-03-20', '10:52:00', 9*60000],
        [17, 21, '2026-03-20', '11:09:00', 8*60000],
        [22, 55, '2026-03-20', '13:00:00', 8*60000],
        [56, 57, '2026-03-21', '08:45:00', 9*60000],
        [58, 76, '2026-03-21', '09:02:00', 8*60000]
    ]

const gameConsts = {
    YEAR: YEAR,
    COMP: COMP,
    GAME_TYPE: GAME_TYPE,
    gameStart: gameStart,
    gameEnd: gameEnd,
    updateConstants: updateConstants,
    sch_constants: sch_constants
}

function updateConstants(year, comp, gameType) {
    gameConsts.YEAR = year
    gameConsts.COMP = comp
    gameConsts.GAME_TYPE = gameType
}


export default gameConsts
