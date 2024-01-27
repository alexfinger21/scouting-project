import { consoleLog } from "../utility.js"
import Map from "./Map.js"
import PiecesMap from "./PiecesMap.js"
import Robot from "./Robot.js"

export default class {
    /*ctx: canvas.getContext('2d')
    allianceColor: "R", "B" */
    constructor({ctx, allianceColor, autonPieceData, alliancePosition, images, cX, cY}) {
        consoleLog(images)
        const canvasSize = {x: cX, y: cY}
        this.ctx = ctx
        this.map = new Map({ctx, allianceColor, img: images.mapImage, canvasSize})
        this.clickable = {}
        this.clickable.robot = new Robot({ctx, clickable: false, allianceColor, img: images.robotImage, canvasSize, alliancePosition})
        this.clickable.pieces = new PiecesMap({ctx, allianceColor, img: images.gamePieceImage, pieceData: autonPieceData, canvasSize})

    }

    onClick({event, leftOffset, topOffset}) {
        const x = event.pageX - leftOffset
        const y = event.pageY - topOffset

        // Collision detection between clicked offset and element.
        Object.values(this.clickable).forEach(function(element) {
            if(element.onClick) {
                element.onClick({x, y})
            }
        })
    }

    sendData() {
        return this.clickable.pieces.sendData()
    }

    draw() {
        //this.ctx.save()

        this.map.draw()
        this.clickable.robot.draw()
        this.clickable.pieces.draw()

        //this.ctx.restore()
    }
}
