  import { consoleLog, lerpColor, lerpOpacity } from "../utility.js"
import DrawableObject from "./DrawableObject.js"

const changePerS = 5

export default class Barge extends DrawableObject {
    constructor({ x, y, ctx, renderQueue, canvasSize }) {
        super({ ctx, renderQueue, img: "rectangle", x, y, sX: canvasSize.x * 0.1, sY: canvasSize.y * 0.4 })
        this.color = "#FFF600"
        this.opacity = 1

        this.lastTick = Date.now()    

    }

    onClick({ x, y }) {
        consoleLog("onclick")
        if (super.inBoundingBox({ x, y })) {
            consoleLog("onclick2")
            this.lastTick = Date.now()
            this.isSelected = true
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
