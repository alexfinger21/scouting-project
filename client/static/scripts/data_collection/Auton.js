import { consoleLog } from "../utility"
import AutonMap from "./AutonMap"
import PiecesMap from "./PiecesMap"
import Robot from "./Robot"

export default class {
    /*ctx: canvas.getContext('2d')
    allianceColor: "red", "blue" */
    constructor({ctx, allianceColor}) {
        this.ctx = ctx
        this.map = new AutonMap(ctx, allianceColor)
        this.robot = new Robot(ctx, allianceColor)
        this.pieces = new PiecesMap(ctx, allianceColor)
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
