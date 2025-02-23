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
            points: [
                {x: this.canvasSize.x*1.137, y: this.canvasSize.y * 0.12},
                {x: this.canvasSize.x * .95, y: this.canvasSize.y * 0.12},
                {x: this.canvasSize.x * 1.137, y: this.canvasSize.y * 0.3 },
            ]
        })
        this.clickable.feederBottom = new FeederStation({ctx, canvasSize: this.canvasSize, ctx, renderQueue: this.renderQueue,
            points: [
                {x: this.canvasSize.x*1.137, y: this.canvasSize.y * 1.16},
                {x: this.canvasSize.x * .95, y: this.canvasSize.y * 1.16},
                {x: this.canvasSize.x * 1.137, y: this.canvasSize.y * 0.98 },
            ]
        })
        this.legend = new Legend({ctx, renderQueue: this.renderQueue, img: images.legendButton, canvasSize: this.canvasSize, text: helpText})
        this.clickable.coralScreens = {}

        for (let i = 0; i<12; ++i) {
            this.clickable.coralScreens[String.fromCharCode(65+i)] = new CoralScreen({ctx, renderQueue: this.renderQueue, allianceColor, letter: String.fromCharCode(65+i), images, canvasSize: this.canvasSize, zIndex: 10})
        }
        
    }

    onClick({ x, y }) {
        // Collision detection between clicked offset and element.
        
        const menuOpen = Object.values(this.clickable.coralScreens).find(e => e.isSelected)
        if (!menuOpen) {
            this.clickable.robots.onClick({x, y})
            this.clickable.barge.onClick({x, y})
            this.legend.onClick({x, y})
            consoleLog("feeder top clicked: ", this.clickable.feederTop.onClick({x, y}))
            consoleLog("feeder bottom clicked: ", this.clickable.feederBottom.onClick({x, y}))
            const cRes = this.clickable.pieces.onClick({x, y})
            if (cRes) {
                this.clickable.coralScreens[cRes.text].isSelected = true
            }

            const aRes = this.clickable.algae.onClick({x, y})
            
        } else {
            Object.values(this.clickable.coralScreens).forEach(e => e.onClick({x, y}))
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
        const res = {}
        res["Starting Location"] = this.clickable.robots.sendData()["Starting Location"] ?? 0
        
        for (const k of Object.keys(this.clickable.coralScreens)) {
            res[k] = this.clickable.coralScreens[k].sendData()
        }

        return res
    }

    draw() {
        this.map.draw()
        this.clickable.robots.draw()
        this.clickable.pieces.draw()
        this.clickable.algae.draw()
        this.clickable.barge.draw()
        this.clickable.feederBottom.draw()
        this.clickable.feederTop.draw()

        this.legend.draw()
        Object.values(this.clickable.coralScreens).forEach(e => {
            e.draw()
            const ltr = this.clickable.pieces.pieces.find(p => p.text == e.letter)
            if (ltr.isSelected != e.isSelected) {
                ltr.lastTick = Date.now()
                ltr.isSelected = e.isSelected
            }
        })
    }
}
