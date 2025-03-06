import { consoleLog, lerpColor, lerpOpacity } from "../utility.js"
import DrawableObject from "./DrawableObject.js"
import Counter from "./Counter.js"

const changePerS = 5

export default class FeederStation extends DrawableObject {
    constructor({ x, y, ctx, count=0, renderQueue, canvasSize, points, showCounter=false, counterX, counterY, }) {
        super({ ctx, renderQueue, img: "triangle", x, y, sX: canvasSize.x * 0.1, sY: canvasSize.y * 0.39, zIndex: 2, points})
        this.color = "#FFF600"
        this.opacity = 0   
        this.count = count
        this.dpr = window.devicePixelRatio
        this.counter = new Counter({ctx, renderQueue: this.renderQueue, canvasSize, count, show: showCounter,
            x: counterX ?? 0,
            y: counterY ?? 0,
        })

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
