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
import Path from "./Path.js"


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
        const isBlue = allianceColor == "B"
        this.canvasSize = {x: cX, y: cY}
        this.dpr = window.devicePixelRatio
        this.ctx = ctx
        this.images = images
        this.clickable = {}
        this.renderQueue = new RenderQueue({ctx: this.ctx, canvasSize: this.canvasSize, dpr: this.dpr})
        this.map = new Map({ctx, renderQueue: this.renderQueue, allianceColor, img: images.mapImage, canvasSize: this.canvasSize})
        this.path = new Path({ ctx, path    : data.auton.path, renderQueue: this.renderQueue, canvasSize: this.canvasSize })
        this.clickable.robots = new RobotMap({ctx, renderQueue: this.renderQueue, allianceColor, images, robotStartingPercent: 0, canvasSize: this.canvasSize})
        this.clickable.algae = new AlgaeMap({ctx, isAuton: true, renderQueue: this.renderQueue, allianceColor, images: images, data: data?.algae, canvasSize: this.canvasSize})
        this.clickable.net = new Net({ctx, renderQueue: this.renderQueue, allianceColor, count: data?.auton?.net?.count, canvasSize: this.canvasSize,
                    x: isBlue ? this.canvasSize.x * 0.05 : this.canvasSize.x * 0.85,
                    y: isBlue ? this.canvasSize.y * 0.55 : this.canvasSize.y * 0.09  ,
                })

              this.clickable.feederTop = new FeederStation({ctx, canvasSize: this.canvasSize, count: data?.feederTop?.count, renderQueue: this.renderQueue,
                    points: [
                        {x: this.canvasSize.x * this.dpr * (isBlue ? 0.8 : 0.21), y: this.canvasSize.y * this.dpr * (isBlue ? 0.097 : 0.035)},
                        {x: this.canvasSize.x * this.dpr * (isBlue ? 0.945 : 0.05), y: this.canvasSize.y * this.dpr * (isBlue ? 0.097 : 0.035)},
                        {x: this.canvasSize.x * this.dpr * (isBlue ? 0.945 : 0.05), y: this.canvasSize.y * this.dpr * (isBlue ? 0.24 : 0.18)},
                    ]
                })
        
                this.clickable.feederBottom = new FeederStation({ctx, canvasSize: this.canvasSize, count: data?.feederBottom?.count, renderQueue: this.renderQueue,
                    points: [
                        {x: this.canvasSize.x * this.dpr * (isBlue ? 0.8 : 0.21) , y: this.canvasSize.y * this.dpr* (isBlue ? 0.962 : 0.9)},
                        {x: this.canvasSize.x * this.dpr * (isBlue ? 0.945 : 0.05), y: this.canvasSize.y * this.dpr * (isBlue ? 0.962 : 0.9) },
                        {x: this.canvasSize.x * this.dpr * (isBlue ? 0.945 : 0.05), y: this.canvasSize.y * this.dpr * (isBlue ? 0.82 : 0.76)},
                    ]
                })
        
                this.clickable.processor = new Processor({ctx, canvasSize: this.canvasSize, count: data?.auton?.processor?.count, renderQueue: this.renderQueue,
                    x: this.canvasSize.x*(isBlue ? 0.135 : 0.685),
                    y: this.canvasSize.y * (isBlue ? 0 : 0.89),
                })
        
        consoleLog("SET ROBOTS TO", this.clickable.robots)
        this.data = data

        this.clickable.pieces = new PiecesMap({ctx, renderQueue: this.renderQueue, allianceColor, img: "circle",  canvasSize: this.canvasSize})
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
        return res
    }

    
    constructPosPath() {
        if(this.data?.auton?.path) {
            const path = this.data.auton.path.split("|").map(step => {
                if (step > 21000 && step < 30000) {
                    const ltr = get_letter(step)
                    const ret = this.clickable.pieces.pieces.find(e => e.text == ltr)
                    return {x: ret.x + ret.radius, y: ret.y + ret.radius}
                } else if (step == 2004) {
                    const ret = this.clickable.processor
                    return {x: ret.x + ret.sX/2, y: ret.y + ret.sY/2}
                } else if (step == 2005) {
                    const ret = this.clickable.net
                    return {x: ret.x + ret.sX/2, y: ret.y + ret.sY/2}
                } else if (step == 2006) {
                    const ret = this.clickable.feederTop
                    return {x: (ret.points[0].x + ret.points[2].x)/2/this.dpr, y: (ret.points[0].y + ret.points[2].y)/2/this.dpr}
                } else if (step == 2007) {
                    const ret = this.clickable.feederBottom
                    return {x: (ret.points[0].x + ret.points[2].x)/2/this.dpr, y: (ret.points[0].y + ret.points[2].y)/2/this.dpr}
                } else if (step >= 2008 && step <= 2013) {
                    const ret = this.clickable.algae.algae.find(e => e.ge_key == step)
                    return {x: ret.x + ret.sX/2, y: ret.y + ret.sY/2}
                }
            })
                
            path.unshift({x: this.clickable.robots.startPositions[0].x + this.clickable.robots.startPositions[0].sX/2, y: this.clickable.robots.startPositions[0].y + this.clickable.robots.startPositions[0].sY/2})
            return path
        }


    }

    draw() {
        this.map.draw()
        this.path.path = this.constructPosPath()
        if(this.path) {
            this.path.draw()
        }
        this.clickable.robots.draw()
        this.clickable.pieces.draw()
        this.clickable.algae.draw()
        this.clickable.net.draw()
        this.clickable.feederBottom.draw()
        this.clickable.feederTop.draw()
        this.clickable.processor.draw()

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
