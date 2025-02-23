import { consoleLog } from "../utility.js"
import Map from "./Map.js"
import PiecesMap from "./PiecesMap.js"
import RobotMap from "./RobotMap.js"
import Legend from "./Legend.js"
import RenderQueue from "./RenderQueue.js"
import CoralScreen from "./coral_screen/CoralScreen.js"
import AlgaeMap from "./AlgaeMap.js"
import Barge from "./Barge.js"
import FeederStation from "./FeederStation.js"

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
        this.clickable.algae =  new AlgaeMap({ctx, isAuton: true, renderQueue: this.renderQueue, allianceColor, images: images, pieceData: autonPieceData, canvasSize: this.canvasSize})
        this.clickable.barge = new Barge({ctx, renderQueue: this.renderQueue, canvasSize: this.canvasSize,
            x: this.canvasSize.x * 0.05,
            y: this.canvasSize.y * 0.55,
        })
        this.clickable.feederTop = new FeederStation({ctx, canvasSize: this.canvasSize, ctx, renderQueue: this.renderQueue,
            x: this.canvasSize.x * 0.745,
            y: this.canvasSize.y * -0.095,
            points: [
                {x: 0, y: 0},
                {x: this.canvasSize.x * 0.18, y: 0},
                {x: this.canvasSize.x * 0.18, y: this.canvasSize.y * 0.17 },
            ]
        })
        this.clickable.feederBottom = new FeederStation({ctx, canvasSize: this.canvasSize, ctx, renderQueue: this.renderQueue,
            x: this.canvasSize.x * 0.745,
            y: this.canvasSize.y * 0.765,
            points: [
                {x: 0, y: 0},
                {x: this.canvasSize.x * 0.18, y: 0},
                {x: this.canvasSize.x * 0.18, y: this.canvasSize.y * -0.17 },
            ]
        })
        this.legend = new Legend({ctx, renderQueue: this.renderQueue, img: images.legendButton, canvasSize: this.canvasSize, text: helpText})
        this.coralScreens = {}

        for (let i = 0; i<12; ++i) {
            this.coralScreens[String.fromCharCode(65+i)] = new CoralScreen({ctx, renderQueue: this.renderQueue, allianceColor, letter: String.fromCharCode(65+i), images, canvasSize: this.canvasSize, zIndex: 10})
        }
        
    }

    onClick({ x, y }) {
        // Collision detection between clicked offset and element.
        
        const menuOpen = Object.values(this.coralScreens).find(e => e.isSelected)
        if (!menuOpen) {
            this.clickable.robots.onClick({x, y})
            this.clickable.barge.onClick({x, y})
            this.legend.onClick({x, y})
            this.clickable.feederTop.onClick({x, y})
            this.clickable.feederBottom.onClick({x, y})
            const cRes = this.clickable.pieces.onClick({x, y})
            if (cRes) {
                this.coralScreens[cRes.text].isSelected = true
            }

            const aRes = this.clickable.algae.onClick({x, y})
            
        } else {
            Object.values(this.coralScreens).forEach(e => e.onClick({x, y}))
        }
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
        this.clickable.algae.draw()
        this.clickable.barge.draw()
        this.clickable.feederTop.draw()
        this.clickable.feederBottom.draw()
        this.legend.draw()
        Object.values(this.coralScreens).forEach(e => {
            e.draw()
            const ltr = this.clickable.pieces.pieces.find(p => p.text == e.letter)
            if (ltr.isSelected != e.isSelected) {
                ltr.lastTick = Date.now()
                ltr.isSelected = e.isSelected
            }
        })
    }
}
