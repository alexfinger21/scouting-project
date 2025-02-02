import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"

export default class Robot extends DrawableObject {
    /* 
    Ctx: canvas.getcontext2dallianceColor: "R" or "B", x: pixels from left
    y: pixels from top
    */
   
    constructor({ctx, clickable, img, containerImg, value, draggable, isSelected, canvasSize, pos}) {
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
        
        this.draggable = draggable ?? false
        this.isSelected = clickable ? (isSelected ?? false) : true
        this.dragLimHeight = Math.floor(canvasSize.y * 0.8)

        if (this.draggable) {
            this.dragOffset = [0, 0]
            this.dragLimits = {y: [pos.y, Math.floor(this.dragLimHeight - sX*0.14)]}
        }

        this.clickable = clickable ?? false 
        
        this.value = value ?? 0


        if(this.clickable) {
            this.mask = new DrawableObject({ctx, img: containerImg, x, y: y - canvasSize.y * 0.005, r: 90, sX, sY: this.dragLimHeight})
        }
    }

    onClick({ x, y }) {
        if (this.clickable && super.inBoundingBox({ x, y })) {
            if (!this.draggable) {
                this.isSelected = !this.isSelected
            }

            return true
        }
        return false
    }

    onMouseDown({ x, y }) {
        consoleLog(x, y, super.inBoundingBox({ x, y }))
        if (this.draggable && super.inBoundingBox({ x, y })) {
            this.dragOffset[0] = this.x - x 
            this.dragOffset[1] = this.y - y 
            this.isSelected = true
        } 
    }

    onMouseUp({ x, y }) {
        if (this.draggable) {
            this.isSelected = false
        } 
    }


    onMouseMove({ x, y }) {
        if (this.isSelected && this.draggable) {
            consoleLog("PERCENT", Math.round((this.y-this.dragLimits.y[0])/(this.dragLimits.y[1] - this.dragLimits.y[0]) * 100)/100)
            this.y = Math.max(Math.min(this.dragLimits.y[1], y + this.dragOffset[1]), this.dragLimits.y[0])
        }
    }


    setIsSelected({value}) {
        this.isSelected = value
    }

    draw() {
        if(this.isSelected || this.draggable) {
            super.draw()
        }
        if(this.clickable) {
            this.mask.draw()
        }
    }
}
