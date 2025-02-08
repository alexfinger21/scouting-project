import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"

export default class ClickArea extends DrawableObject {
    /* 
    Ctx: canvas.getcontext2dallianceColor: "R" or "B", x: pixels from left
    y: pixels from top
    */
   
    constructor({ctx, clickable, value, img, renderQueue, containerImg, isSelected, canvasSize, pos}) {
        let x = 0
        let y = 0
        let r = 0
        const sX = Math.floor(canvasSize.x * 0.13) 
        const sY = Math.floor(canvasSize.x * 0.13) 

        if(pos) {
            x = pos.x ?? 0
            y = pos.y ?? 0
            r = pos.r ?? 0
        }


        super({ctx, img, x, y, r, sX, sY})
        
        this.isSelected = clickable ? (isSelected ?? false) : true

        this.renderQueue = renderQueue

        this.clickable = clickable ?? false 
        
        this.value = value ?? 0
    }

    onClick({ x, y }) {
        if (this.clickable && super.inBoundingBox({ x, y })) {
            this.isSelected = !this.isSelected
            return true
        }
        return false
    }


    setIsSelected({value}) {
        this.isSelected = value
    }

    draw() {
        super.draw()
    }
}
