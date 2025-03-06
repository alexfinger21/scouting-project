  import { consoleLog, lerpColor, lerpOpacity } from "../utility.js"
import Counter from "./Counter.js"
import DrawableObject from "./DrawableObject.js"

const changePerS = 5

export default class Net extends DrawableObject {
    constructor({ x, y, ctx, count=0, renderQueue, canvasSize, showCounter=false }) {
        super({ ctx, count, renderQueue, img: "rectangle", x, y, sX: canvasSize.x * 0.1, sY: canvasSize.y * 0.39 })
        this.color = "#FFF600"
        this.opacity = 0    
        this.count = count
        this.counter = new Counter({ctx, renderQueue: this.renderQueue, canvasSize, count, show: showCounter,
            x: x - canvasSize.x * 0.01,
            y: y + canvasSize.y * 0.135,
        })
        this.lastTick = Math.max()   

    }

    onClick({ x, y }) {
        if (super.inBoundingBox({ x, y })) {
            this.count++
            this.lastTick = Date.now()            
            return true
        }
        return false
    }

    sendData() {
        return {
            "score": this.count
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
