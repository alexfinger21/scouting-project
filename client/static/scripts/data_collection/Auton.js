import { consoleLog } from "../utility.js"
import Map from "./Map.js"
import PiecesMap from "./PiecesMap.js"
import RobotMap from "./RobotMap.js"
import Legend from "./Legend.js"
import RenderQueue from "./RenderQueue.js"
import CoralScreen from "./coral_screen/CoralScreen.js"

const helpText = `1. Drag robot approx. start pos
2. Click on reef to select where and which level piece was scored
3. add or remove steps as necessary in the action queue below`

export default class {
    /*ctx: canvas.getContext('2d')
    allianceColor: "R", "B" */
    constructor({ctx, allianceColor, autonPieceData, robotData, images, cX, cY}) {
        this.canvasSize = {x: cX, y: cY}
        this.dpr = window.devicePixelRatio
        consoleLog("CTX SIZE", images, this.canvasSize)
        this.ctx = ctx
        this.renderQueue = new RenderQueue({ctx: this.ctx, canvasSize: this.canvasSize, dpr: this.dpr})
        this.map = new Map({ctx, renderQueue: this.renderQueue, allianceColor, img: images.mapImage, canvasSize: this.canvasSize})
        this.clickable = {}
        this.clickable.robots = new RobotMap({ctx, renderQueue: this.renderQueue, allianceColor, images, robotStartingPercent: robotData, canvasSize: this.canvasSize})
        this.clickable.pieces = new PiecesMap({ctx, isAuton: true, renderQueue: this.renderQueue, allianceColor, img: "circle", pieceData: autonPieceData, canvasSize: this.canvasSize})
        this.legend = new Legend({ctx, renderQueue: this.renderQueue, img: images.legendButton, canvasSize: this.canvasSize, text: helpText})
        //this.coralScreen = new CoralScreen({ctx, renderQueue: this.renderQueue, allianceColor, letter: "H", images, canvasSize: this.canvasSize, zIndex: 10})
        
    }

    onClick({ x, y }) {
        // Collision detection between clicked offset and element.
        this.clickable.pieces.onClick({x, y})
        this.clickable.robots.onClick({x, y})
        this.legend.onClick({x, y})
        this.coralScreen.onClick({x, y})
    }

    onMouseDown({ x, y }) {
        this.clickable.robots.onMouseDown({x, y})
    }
    
    onMouseMove({ x, y }) {
        this.clickable.robots.onMouseMove({x, y})
    }

    onMouseUp({ x, y }) {
        this.clickable.robots.onMouseUp({x, y})
    }


    sendData() {
        return {
            //autonPieceData: this.clickable.pieces.sendData(),
            "Starting Location": this.clickable.robots.sendData()["Starting Location"] ?? 0,
        }
    }

    draw() {
        this.map.draw()
        this.clickable.robots.draw()
        this.clickable.pieces.draw()
        this.legend.draw()
        //this.coralScreen.draw()
    }
}
