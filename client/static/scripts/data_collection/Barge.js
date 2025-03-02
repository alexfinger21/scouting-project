  import { consoleLog, lerpColor, lerpOpacity } from "../utility.js"
import DrawableObject from "./DrawableObject.js"

const changePerS = 5

export default class Barge extends DrawableObject {
    constructor({ x, y, ctx, count=0, renderQueue, canvasSize }) {
        super({ ctx, count, renderQueue, img: "rectangle", x, y, sX: canvasSize.x * 0.1, sY: canvasSize.y * 0.39 })
        this.color = "#FFF600"
        this.opacity = 0    
        this.count = count
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

    draw() {
        this.opacity = lerpOpacity(1, 
            0, 
            Date.now() - this.lastTick,
            changePerS
        )

        
        super.draw()
    }
}
