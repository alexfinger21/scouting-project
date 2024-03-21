const YEAR = 2024
const COMP = "ohcl"
const GAME_TYPE = "P"
const gameStart = new Date("Febuary 29, 2024")
const gameEnd = new Date("March 10, 2024")
const sch_constants =
    [[1, 10, '2024-02-29', '09:00:00', 600000],
    [11, 22, '2024-02-29', '10:40:00', 420000], 
    [23, 60, '2024-02-29', '13:00:00', 420000], 
    [61, 87, '2024-02-30', '09:00:00', 420000]]
module.exports = {
    YEAR: YEAR,
    COMP: COMP,
    GAME_TYPE: GAME_TYPE,
    gameStart: gameStart,
    gameEnd: gameEnd,
    sch_constants: sch_constants
}
