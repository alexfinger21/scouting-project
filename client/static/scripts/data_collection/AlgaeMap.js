import { consoleLog } from "../utility.js"
import Algae from "./Algae.js"
import DrawableObject from "./DrawableObject.js"
import GamePiece from "./GamePiece.js"

export default class AlgaeMap {
    constructor({ ctx, allianceColor, images, renderQueue, data={}, canvasSize }) {
        consoleLog("ALGAE DATA", data)
        this.renderQueue = renderQueue
        this.algae = []
        const isBlue = allianceColor == "B" 
        //Add Pickup Wing Notes ge_key 202-204
        //Wing Notes
        const dist = canvasSize.x * 0.1
        const startAng = 0
        const ctr = isBlue ? [canvasSize.x * 0.575, canvasSize.y * 0.49] : [canvasSize.x * 0.35, canvasSize.y * 0.4235]
        for (let i = 0; i < 6; ++i) {
            this.algae.push(new Algae({
                x: ctr[0] + dist*Math.cos(startAng - Math.PI/3*i),
                y: ctr[1] + dist*Math.sin(startAng - Math.PI/3*i),
                ctx,
                images,
                renderQueue, 
                isSelected: data?.[String(2008+i)]?.isSelected,
                ge_key: 2008 + i,
                text: String.fromCharCode(65+i),
                isBlue,
                zIndex: 999999,
                canvasSize
            }))  
        }

        //console.log(this.pieces)
    }

    onClick({ x, y }) {
        let res = null
        this.algae.forEach(function(algae) {
            if (!res && algae.onClick({ x, y })) {
                res = algae
            }
        })

        return res ?? false
    }

    sendData() {
        const data = {}

        for (const x of this.algae) {
            data[x.ge_key] = x.sendData()
        }

        return data
    }

    draw() {
        this.algae.forEach(function (algae) {
            algae.draw()
        })
    }
}
