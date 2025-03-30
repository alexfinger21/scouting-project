import { consoleLog } from "../utility.js"
import Map from "./Map.js"
import PiecesMap from "./PiecesMap.js"
import Legend from "./Legend.js"
import RenderQueue from "./RenderQueue.js"
import CoralScreen from "./coral_screen/CoralScreen.js"
import AlgaeMap from "./AlgaeMap.js"
import Net from "./Net.js"
import FeederStation from "./FeederStation.js"
import Processor from "./Processor.js"

const helpText = `1. Click on reef to select where and which level piece was scored
2 click on map items to score
3. double click to remove scoring`

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
export default class AutonHeatMap {
    /*ctx: canvas.getContext('2d')
    allianceColor: "R", "B" */
    constructor({ctx, allianceColor, data, images, cX, cY}) {
        this.canvasSize = {x: cX, y: cY}
        this.dpr = window.devicePixelRatio
        this.ctx = ctx
        this.images = images
        this.renderQueue = new RenderQueue({ctx: this.ctx, canvasSize: this.canvasSize, dpr: this.dpr})
        this.map = new Map({ctx, renderQueue: this.renderQueue, allianceColor, img: images.mapImage, canvasSize: this.canvasSize})
        this.clickable = {}
        const isBlue = allianceColor == "B"

        this.clickable.pieces = new PiecesMap({ctx, renderQueue: this.renderQueue, allianceColor, img: "circle",  canvasSize: this.canvasSize})

        this.clickable.net = new Net({ctx, renderQueue: this.renderQueue, allianceColor, count: data?.teleop?.net?.count, canvasSize: this.canvasSize, showCounter: true,
            x: isBlue ? this.canvasSize.x * 0.05 : this.canvasSize.x * 0.85,
            y: isBlue ? this.canvasSize.y * 0.55 : this.canvasSize.y * 0.09  ,
        })


        this.clickable.processor = new Processor({ctx, canvasSize: this.canvasSize, count: data?.teleop?.processor?.count, renderQueue: this.renderQueue, showCounter: true,
            x: this.canvasSize.x*(isBlue ? 0.135 : 0.685),
            y: this.canvasSize.y * (isBlue ? 0 : 0.89),
        })

        this.legend = new Legend({ctx, renderQueue: this.renderQueue, img: images.legendButton, canvasSize: this.canvasSize, text: helpText})
        this.clickable.coralScreens = {}

        for (let i = 0; i<12; ++i) {
            this.clickable.coralScreens[String.fromCharCode(65+i)] = new CoralScreen({ctx, renderQueue: this.renderQueue, allianceColor, letter: String.fromCharCode(65+i), images, canvasSize: this.canvasSize, zIndex: 10})
        }
    }

    onClick({ x, y }) {
        // Collision detection between clicked offset and element.
        
        /*const menuOpen = Object.values(this.clickable.coralScreens).find(e => e.isSelected)
        if (!menuOpen) {
            this.legend.onClick({x, y})
            this.clickable.processor.onClick({x, y}, true)
            this.clickable.net.onClick({x, y}, true)
            const cRes = this.clickable.pieces.onClick({x, y})
            if (cRes) {
                this.clickable.coralScreens[cRes.text].isSelected = true
            }
            
        } else {
            Object.values(this.clickable.coralScreens).forEach(e => {
                if(e.isSelected) {
                    e.onClick({x, y}) 
                }
            })
        }*/
    }


    sendData() {
        const res = {}
        res.teleop = {}
        
        for (const k of Object.keys(this.clickable.coralScreens)) {
            res.teleop[k] = this.clickable.coralScreens[k].sendData()
        }

        res.teleop.net = this.clickable.net.sendData()
        res.teleop.processor = this.clickable.processor.sendData()

        return res
    }

    draw() {
        this.map.draw()
        this.clickable.pieces.draw()
        this.clickable.net.draw()
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
