import { consoleLog } from "../utility.js"
import AutonMap from "./AutonMap.js"
import PiecesMap from "./PiecesMap.js"
import Robot from "./Robot.js"

export default class {
    /*ctx: canvas.getContext('2d')
    allianceColor: "R", "B" */
    constructor({ctx, allianceColor, images, cX, cY}) {
        consoleLog("IMAGES: ")
        consoleLog(images)
        const canvasSize = {x: cX, y: cY}
        this.ctx = ctx
        this.map = new AutonMap({ctx, allianceColor, img: images.autonMapImage, canvasSize})
        this.robot = new Robot({ctx, allianceColor, img: images.robotImage, canvasSize})
        this.pieces = new PiecesMap({ctx, allianceColor, img: images.gamePieceImage, canvasSize})

    }

    draw() {
        //this.ctx.save()

        this.map.draw()
        this.robot.draw()
        this.pieces.draw()

        //this.ctx.restore()
    }
}
