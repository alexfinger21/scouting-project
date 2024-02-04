import { consoleLog } from "../utility.js"
import Map from "./Map.js"
import PiecesMap from "./PiecesMap.js"
import Robot from "./Robot.js"
import RobotMap from "./RobotMap.js"

export default class {
    /*ctx: canvas.getContext('2d')
    allianceColor: "R", "B" */
    constructor({ctx, allianceColor, autonPieceData, robotData, images, cX, cY}) {
        consoleLog(images)
        this.canvasSize = {x: cX, y: cY}
        this.ctx = ctx
        this.map = new Map({ctx, allianceColor, img: images.mapImage, canvasSize: this.canvasSize})
        this.clickable = {}
        this.clickable.robots = new RobotMap({ctx, allianceColor, images, startPositions: robotData, canvasSize: this.canvasSize})
        this.clickable.pieces = new PiecesMap({ctx, isAuton: true, allianceColor, img: images.gamePieceImage, pieceData: autonPieceData, canvasSize: this.canvasSize})

    }

    onClick({event, leftOffset, topOffset}) {
        const x = event.pageX - leftOffset
        const y = event.pageY - topOffset

        // Collision detection between clicked offset and element.
        this.clickable.pieces.onClick({x, y})
        this.clickable.robots.onClick({x, y})
    }

    sendData() {
        return {
            autonPieceData: this.clickable.pieces.sendData(),
            "Starting Location": this.clickable.robots.sendData()["Starting Location"] ?? 0,
        }
    }

    draw() {
        this.ctx.save()
        this.ctx.setTransform(1, 0, 0, 1, 0, 0); //reset canvas transform just in case
        this.ctx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y);

        this.map.draw()
        this.clickable.robots.draw()
        this.clickable.pieces.draw()

        this.ctx.restore()
    }
}
