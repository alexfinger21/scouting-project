import { consoleLog } from "../utility.js"
import Map from "./Map.js"
import PiecesMap from "./PiecesMap.js"
import RobotMap from "./RobotMap.js"
import Legend from "./Legend.js"

const helpText = `1. Tap square to approx. start pos
2. Orange note: picked up by robot`

export default class {
    /*ctx: canvas.getContext('2d')
    allianceColor: "R", "B" */
    constructor({ctx, allianceColor, autonPieceData, robotData, images, cX, cY}) {
        consoleLog(images)
        this.canvasSize = {x: cX, y: cY}
        this.ctx = ctx
        this.map = new Map({ctx, allianceColor, img: images.mapImage, canvasSize: this.canvasSize})
        this.clickable = {}
        this.clickable.robots = new RobotMap({ctx, allianceColor, images, robotStartingPercent: robotData, canvasSize: this.canvasSize})
        //this.clickable.pieces = new PiecesMap({ctx, isAuton: true, allianceColor, img: images.gamePieceImage, pieceData: autonPieceData, canvasSize: this.canvasSize})
        this.legend = new Legend({ctx, img: images.legendButton, canvasSize: this.canvasSize, text: helpText})
        this.dpr = window.devicePixelRatio
    }

    onClick({event, leftOffset, topOffset}) {
        const x = event.pageX - leftOffset
        const y = event.pageY - topOffset

        // Collision detection between clicked offset and element.
        //this.clickable.pieces.onClick({x, y})
        this.clickable.robots.onClick({x, y})
        this.legend.onClick({x, y})
    }

    onMouseDown({event, leftOffset, topOffset}) {
        const x = event.pageX - leftOffset
        const y = event.pageY - topOffset

        this.clickable.robots.onMouseDown({x, y})
    }

    onMouseUp({event, leftOffset, topOffset}) {
        const x = event.pageX - leftOffset
        const y = event.pageY - topOffset

        this.clickable.robots.onMouseUp({x, y})
    }

    onMouseMove({event, leftOffset, topOffset}) {
        const x = event.pageX - leftOffset
        const y = event.pageY - topOffset

        this.clickable.robots.onMouseMove({x, y})
    }

    sendData() {
        return {
            //autonPieceData: this.clickable.pieces.sendData(),
            "Starting Location": this.clickable.robots.sendData()["Starting Location"] ?? 0,
        }
    }

    draw() {
        
        this.ctx.save()
        this.ctx.setTransform(1/this.dpr, 0, 0, 1/this.dpr, 0, 0) //reset canvas transform just in case and set dpr (device pixel ratio) to remove blur
        this.ctx.clearRect(0, 0, this.canvasSize.x, this.canvasSize.y)

        this.map.draw()
        this.clickable.robots.draw()
        //this.clickable.pieces.draw()
        this.legend.draw()

        this.ctx.restore()
    }
}
