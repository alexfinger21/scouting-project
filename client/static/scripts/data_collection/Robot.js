import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"

export default class Robot extends DrawableObject {
    /* 
    Ctx: canvas.getcontext2dallianceColor: "R" or "B", x: pixels from left
    y: pixels from top
    */
   
    constructor({ctx, clickable, img, renderQueue, allianceColor, containerImg, value, draggable, isSelected, canvasSize, pos}) {
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


        super({ctx, img, renderQueue, x, y, r, sX, sY})
        
        this.draggable = draggable ?? false
        this.isSelected = clickable ? (isSelected ?? false) : true
        this.dragLimHeight = Math.floor(canvasSize.y * 0.8)

        if (this.draggable) {
            this.dragOffset = [0, 0]
            this.dragLimits = {y: [pos.y, Math.floor(this.dragLimHeight - sX*(allianceColor == "B" ? 0.14 : 0.56))]}
        }

        this.clickable = clickable ?? false 
        
        this.value = value ?? 0

        if (this.draggable && this.value) {
            consoleLog("VALUE: ", this.y)
            this.y = this.dragLimits.y[0] + this.value * (this.dragLimits.y[1] - this.dragLimits.y[0])
            consoleLog(this.y)
        }

        if(this.clickable) {
            this.mask = new DrawableObject({ctx, renderQueue, img: containerImg, x, y: y - canvasSize.y * 0.005, r: 90, sX, sY: this.dragLimHeight})
        }
    }

    onClick({ x, y, event }) {
        if (this.clickable && super.inBoundingBox({ x, y })) {
            if (!this.draggable) {
                this.isSelected = !this.isSelected
            }

            return true
        }
        return false
    }

    onMouseDown({ x, y, event }) {
        consoleLog(x, y, super.inBoundingBox({ x, y }))
        if (this.draggable && super.inBoundingBox({ x, y })) {
            event.preventDefault()
            this.dragOffset[0] = this.x - x 
            this.dragOffset[1] = this.y - y 
            this.isSelected = true
        } 
    }

    onMouseUp({ x, y, event }) {
        if (this.draggable) {
            event.preventDefault()
            this.isSelected = false
        } 
    }


    onMouseMove({ x, y, event }) {
        if (this.isSelected && this.draggable) {
            //consoleLog("PERCENT", Math.round((this.y-this.dragLimits.y[0])/(this.dragLimits.y[1] - this.dragLimits.y[0]) * 100)/100)
            event.preventDefault()
            this.y = Math.max(Math.min(this.dragLimits.y[1], y + this.dragOffset[1]), this.dragLimits.y[0])
        }
    }

    getRobotPosition() {
        if (this.draggable) {
            const p = Math.round((this.y-this.dragLimits.y[0])/(this.dragLimits.y[1] - this.dragLimits.y[0]) * 100)/100
            return p
        }
    }

    sendData() {
        return {"Starting Position": this.getRobotPosition()}
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
