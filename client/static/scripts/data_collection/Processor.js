import { consoleLog, lerpColor, lerpOpacity } from "../utility.js"
import Counter from "./Counter.js"
import DrawableObject from "./DrawableObject.js"

const changePerS = 5

export default class Processor extends DrawableObject {
    constructor({ x, y, ctx, count=0, renderQueue, canvasSize, points, showCounter=false }) {
        super({ ctx, renderQueue, img: "rectangle", x, y,  sX: canvasSize.x * 0.18, sY: canvasSize.y * 0.1, zIndex: 2, points})
        this.color = "#FFF600"
        this.opacity = 0   
        this.count = count
        this.counter = new Counter({ctx, renderQueue: this.renderQueue, canvasSize, count, show: showCounter,
            x: x + canvasSize.x * 0.03,
            y: y + canvasSize.y * 0.007,
        })
        this.counter.color = "#000000"
        this.lastTick = Math.max()    

    }
    
    onClick({ x, y }) {
        if (super.inBoundingBox({x, y, })) {
            this.lastTick = Date.now()
            this.count++
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
        this.counter.count = this.count
        this.opacity = lerpOpacity(1, 
            0, 
            Date.now() - this.lastTick,
            changePerS
        )

        super.draw()
        this.counter.draw()
    }
}
