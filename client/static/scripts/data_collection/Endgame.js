import { consoleLog } from "../utility.js"
import Map from "./Map.js"
import PiecesMap from "./PiecesMap.js"
import Robot from "./Robot.js"
import RobotMap from "./RobotMap.js"

export default class {
    /*ctx: canvas.getContext('2d')
    allianceColor: "R", "B" */
    constructor({ctx, allianceColor, robotData, endgamePieceData, images, cX, cY}) {
        const canvasSize = {x: cX, y: cY}
        const isBlue = allianceColor == "B"
        this.ctx = ctx
        this.map = new Map({ctx, allianceColor, img: images.mapImage, canvasSize})
        this.clickable = {}
        this.clickable.robots = new RobotMap({ctx, allianceColor, images, stagePositions: robotData, canvasSize})
        this.clickable.pieces = new PiecesMap({ctx, allianceColor, isAuton: false, img: images.gamePieceImage, pieceData: endgamePieceData, canvasSize})
    }

    onClick({event, leftOffset, topOffset}) {
        const x = event.pageX - leftOffset
        const y = event.pageY - topOffset

        // Collision detection between clicked offset and element.
        this.clickable.robots.onClick({x, y})

        this.clickable.pieces.onClick({x, y})
        
    }

    sendData() {
        return {
            spotlights: this.clickable.pieces.sendData(),
            "Instage Location": this.clickable.robots.sendData() 
        }

    }

    draw() {
        //this.ctx.save()

        this.map.draw()
        this.clickable.robots.draw()
        this.clickable.pieces.draw()

        //this.ctx.restore()
    }
}
