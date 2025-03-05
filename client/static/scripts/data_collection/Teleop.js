import { consoleLog } from "../utility.js"
import Map from "./Map.js"
import PiecesMap from "./PiecesMap.js"
import RobotMap from "./RobotMap.js"
import Legend from "./Legend.js"
import RenderQueue from "./RenderQueue.js"
import CoralScreen from "./coral_screen/CoralScreen.js"
import AlgaeMap from "./AlgaeMap.js"
import Net from "./Net.js"
import FeederStation from "./FeederStation.js"
import Processor from "./Processor.js"

const helpText = `1. Drag robot approx. start pos
2. Click on reef to select where and which level piece was scored
3. add or remove steps as necessary in the action queue below` 

//return correct coral ge_key
const coral_ge_key = (level, letter, scored=true) => {
    return 20000 + level * 1000 + (letter.charCodeAt(0) - 65) * 10 + (scored == true ? 1 : 0)
}

//get letter from coral ge_key
const get_letter = (ge_key) => {
    return String.fromCharCode(65 + Number(("" + ge_key).substring(2, 4)) )
}

//get row from coral ge_key
const get_row = (ge_key) => {
    return Number(("" + ge_key).substring(1, 2))
}

//get is scored from coral ge_key
const get_scored = (ge_key) => {
    return ge_key % 2 == 1
}
export default class {
    /*ctx: canvas.getContext('2d')
    allianceColor: "R", "B" */
    constructor({ctx, allianceColor, teleopPieceData, robotData, images, cX, cY}) {
        consoleLog("START")
        consoleLog(ctx, allianceColor, teleopPieceData, robotData, images, cX, cY)
        this.canvasSize = {x: cX, y: cY}
        this.dpr = window.devicePixelRatio
        this.ctx = ctx
        this.images = images
        this.renderQueue = new RenderQueue({ctx: this.ctx, canvasSize: this.canvasSize, dpr: this.dpr})
        this.map = new Map({ctx, renderQueue: this.renderQueue, allianceColor, img: images.mapImage, canvasSize: this.canvasSize})
        this.clickable = {}
        this.clickable.robots = new RobotMap({ctx, renderQueue: this.renderQueue, allianceColor, images, robotStartingPercent: robotData, canvasSize: this.canvasSize})
        this.clickable.pieces = new PiecesMap({ctx, isAuton: true, renderQueue: this.renderQueue, allianceColor, img: "circle", pieceData: teleopPieceData, canvasSize: this.canvasSize})
        this.clickable.net = new Net({ctx, renderQueue: this.renderQueue, canvasSize: this.canvasSize,
            x: this.canvasSize.x * 0.05,
            y: this.canvasSize.y * 0.55,
        })
        this.clickable.feederTop = new FeederStation({ctx, canvasSize: this.canvasSize, renderQueue: this.renderQueue,
            points: [
                {x: this.canvasSize.x * this.dpr * 0.8, y: this.canvasSize.y * this.dpr * 0.097},
                {x: this.canvasSize.x * this.dpr * 0.945, y: this.canvasSize.y * this.dpr * 0.097},
                {x: this.canvasSize.x * this.dpr * 0.945, y: this.canvasSize.y * this.dpr * 0.24},
            ]
        })
        this.clickable.feederBottom = new FeederStation({ctx, canvasSize: this.canvasSize, renderQueue: this.renderQueue,
            points: [
                {x: this.canvasSize.x * 0.8 * this.dpr , y: this.canvasSize.y * 0.962 * this.dpr},
                {x: this.canvasSize.x * .945 * this.dpr, y: this.canvasSize.y * 0.962 * this.dpr},
                {x: this.canvasSize.x * 0.945 * this.dpr, y: this.canvasSize.y * 0.82 * this.dpr},
            ]
        })
        this.clickable.processor = new Processor({ctx, canvasSize: this.canvasSize, renderQueue: this.renderQueue,
            x: this.canvasSize.x*0.135,
            y: this.canvasSize.y * 0
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
            if(this.clickable.net.onClick({x, y})) {
            }
            this.legend.onClick({x, y})
            if(this.clickable.feederTop.onClick({x, y})) {
            }
            if(this.clickable.feederBottom.onClick({x, y})) {
            }
            if(this.clickable.processor.onClick({x, y})) {
            }
            const cRes = this.clickable.pieces.onClick({x, y})
            if (cRes) {
                this.clickable.coralScreens[cRes.text].isSelected = true
            }
            
        } else {
            Object.values(this.clickable.coralScreens).forEach(e => {
                if(e.isSelected) {
                    const clicked = e.onClick({x, y}) 
                    if(clicked ) {//proceed button was clicked
                    }
                }
            })
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
        res.auton = {}
        
        for (const k of Object.keys(this.clickable.coralScreens)) {
            res.auton[k] = this.clickable.coralScreens[k].sendData()
        }

        res["feederTop"] = this.clickable.feederTop.sendData() 
        res["feederBottom"] = this.clickable.feederBottom.sendData() 
        res["feederTop"] = this.clickable.feederTop.sendData() 

        res["autonPath"] = Array.from(this.table.children[1].children).slice(1).map(tr => tr.getAttribute("ge_key")).join('|')
        res["net"] = this.clickable.net.sendData()

        consoleLog(res)

        return res
    }

    draw() {
        this.map.draw()
        this.clickable.robots.draw()
        this.clickable.pieces.draw()
        this.clickable.net.draw()
        this.clickable.feederBottom.draw()
        this.clickable.feederTop.draw()
        this.clickable.processor.draw()

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
