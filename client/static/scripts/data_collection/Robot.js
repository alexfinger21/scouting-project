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

        if(pos) {
            x = pos.x ?? 0
            y = pos.y ?? 0
            r = pos.r ?? 0
        }


        super({ctx, img, x, y, r, sX: Math.floor(canvasSize.x * 0.13), sY: Math.floor(canvasSize.x * 0.13)});
        
        this.draggable = draggable ?? false
        this.isSelected = clickable ? (isSelected ?? false) : true
        consoleLog("SELECTED: ", this.isSelected)

        this.clickable = clickable ?? false 
        
        this.value = value ?? 0

        if(this.clickable) {
            this.mask = new DrawableObject({ctx, img: containerImg, x, y, r, sX: Math.floor(canvasSize.y * 0.13), sY: Math.floor(canvasSize.x*0.13)})
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
        if (this.draggable && super.inBoundingBox({ x, y })) {
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
            this.y = y 
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
