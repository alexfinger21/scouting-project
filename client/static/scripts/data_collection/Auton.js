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
        this.clickable = {}
        this.clickable.robot = new Robot({ctx, allianceColor, img: images.robotImage, canvasSize})
        this.clickable.pieces = new PiecesMap({ctx, allianceColor, img: images.gamePieceImage, canvasSize})

    }

    onClick({event, leftOffset, topOffset, scrollOffset}) {
        const x = event.pageX - leftOffset
        const y = event.pageY - topOffset + scrollOffset

        // Collision detection between clicked offset and element.
        Object.values(this.clickable).forEach(function(element) {
            if(element.onClick) {
                consoleLog(element)
                element.onClick({x, y})
            }
        })
    }

    draw() {
        //this.ctx.save()

        this.map.draw()
        this.clickable.robot.draw()
        this.clickable.pieces.draw()

        //this.ctx.restore()
    }
}
