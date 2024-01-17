import { consoleLog } from "../utility"

export default class {
    constructor(ctx, map, robot, gamePieces) {
        this.ctx = ctx
        this.map = map
        this.robot = robot
        this.pieces = gamePieces
    }

    draw() {
        ctx.save()

        for (const piece in this.pieces) {
            //do stuff
            consoleLog(piece)
        }

        ctx.restore()
    }
}
