const YEAR = 2025
const COMP = "ohcl"
const GAME_TYPE = "Q"
const gameStart = new Date("April 1, 2025")
const gameEnd = new Date("April 17, 2025")
const sch_constants =
    [[1, 5, '2025-04-04', '08:54:00', 420000],
    [6, 11, '2025-04-04', '09:30:00', 420000], 
    [12, 17, '2025-04-04', '10:13:00', 420000], 
    [18, 23, '2025-04-04', '10:56:00', 420000],
    [24, 25, '2025-04-04', '09:00:00', 420000],
    [26, 37, '2025-04-04', '13:00:00', 420000],
    [38, 43, '2025-04-04', '14:26:00', 420000],
    [44, 49, '2025-04-04', '15:09:00', 420000],
    [50, 55, '2025-04-04', '15:52:00', 420000],
    [56, 61, '2025-04-04', '16:35:00', 420000],
    [62, 66, '2025-04-04', '17:18:00', 420000],
    [67, 71, '2025-04-05', '08:53:00', 420000],
    [72, 77, '2025-04-05', '09:29:00', 420000],
    [78, 83, '2025-04-05', '10:12:00', 420000],
    [84, 89, '2025-04-05', '10:55:00', 420000],
    [90, 94, '2025-04-05', '11:38:00', 420000],]

//

module.exports = {
    YEAR: YEAR,
    COMP: COMP,
    GAME_TYPE: GAME_TYPE,
    gameStart: gameStart,
    gameEnd: gameEnd,
    sch_constants: sch_constants
}
