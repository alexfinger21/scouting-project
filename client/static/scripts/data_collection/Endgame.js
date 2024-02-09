import { consoleLog } from "../utility.js"
import Map from "./Map.js"
import PiecesMap from "./PiecesMap.js"
import Robot from "./Robot.js"
import RobotMap from "./RobotMap.js"

export default class {
    /*ctx: canvas.getContext('2d')
    allianceColor: "R", "B" */
    constructor({ctx, allianceColor, robotData, endgamePieceData, images, cX, cY}) {
        this.canvasSize = {x: cX, y: cY}
        const isBlue = allianceColor == "B"
        this.ctx = ctx
        this.map = new Map({ctx, allianceColor, img: images.mapImage, canvasSize: this.canvasSize})
        this.clickable = {}
        this.clickable.robots = new RobotMap({ctx, allianceColor, images, stagePositions: robotData, canvasSize: this.canvasSize})
        this.clickable.pieces = new PiecesMap({ctx, allianceColor, isAuton: false, img: images.gamePieceImage, pieceData: endgamePieceData, canvasSize: this.canvasSize})
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
            "Instage Location": this.clickable.robots.sendData()["Instage Location"] ?? 0
        }

    }

    draw() {
        this.ctx.save()
        
        if (document.getElementById("on-stage").checked == false && document.getElementById("harmony").checked == false) {
             for (const x of this.clickable.robots.stagePositions) {
                if (x.isSelected) {
                    document.getElementById("on-stage").checked = true
                    break
                }
            }
        }


        if (document.getElementById("on-stage").checked == true ||  document.getElementById("harmony").checked == true) {
            let selected = false
            for (const x of this.clickable.robots.stagePositions) {
                if (x.isSelected) {
                    selected = true
                    break
                }
            }
            if (!selected) {
                document.getElementById("on-stage").checked = false
                document.getElementById("harmony").checked = false
            }
        }
        this.ctx.setTransform(1, 0, 0, 1, 0, 0); //reset canvas transform just in case
        this.ctx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y)

        this.map.draw()
        this.clickable.robots.draw()
        this.clickable.pieces.draw()

        this.ctx.restore()
    }
}
