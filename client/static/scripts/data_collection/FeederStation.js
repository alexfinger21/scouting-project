import { consoleLog, lerpColor, lerpOpacity } from "../utility.js"
import DrawableObject from "./DrawableObject.js"

const changePerS = 5

export default class FeederStation extends DrawableObject {
    constructor({ x, y, ctx, count=0, renderQueue, canvasSize, points }) {
        super({ ctx, renderQueue, img: "triangle", x, y, sX: canvasSize.x * 0.1, sY: canvasSize.y * 0.39, zIndex: 2, points})
        this.color = "#FFF600"
        this.opacity = 0   
        this.count = count

        this.lastTick = Math.max()    

    }

    onClick({ x, y }) {
        if (super.inBoundingTriangle({ x, y })) {
            this.lastTick = Date.now()
            ++this.count
            return true
        }
        return false
    }

    sendData() {
        return {
            "count": this.count
        }
    }

    draw() {
        this.opacity = lerpOpacity(1, 
            0, 
            Date.now() - this.lastTick,
            changePerS
        )

        
        super.draw()
    }
}
