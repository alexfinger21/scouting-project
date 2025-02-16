import { lerpOpacity } from "../../utility.js"
import DrawableObject from "../DrawableObject.js"

const changePerS = 10

export default class ClickArea extends DrawableObject {
    /* 
    Ctx: canvas.getcontext2dallianceColor: "R" or "B", x: pixels from left
    y: pixels from top
    */
   
    constructor({ctx, clickable, value, img, renderQueue, containerImg, isSelected, canvasSize, pos, zIndex}) {
        let x = 0
        let y = 0
        let r = 0
        const sX = Math.floor(canvasSize.x * 0.38) 
        const sY = Math.floor(canvasSize.x * 0.1) 

        if(pos) {
            x = pos.x ?? 0
            y = pos.y ?? 0
            r = pos.r ?? 90
        }

        super({ctx, renderQueue, img, x, y, r, sX, sY, zIndex})

        this.highlight = new DrawableObject({ctx, renderQueue, zIndex: zIndex-0.5, x, y, sX, sY, r: 90, img: "rectangle", opacity: 0.5})
        this.highlight.color = "rgba(255,251,126)"
        
        this.isSelected = clickable ? (isSelected ?? false) : true

        this.renderQueue = renderQueue

        this.clickable = clickable ?? false 
        this.highlight.opacity = this.isSelected ? 0 : .5
        this.lastTick = Date.now()    
        
        this.value = value ?? 0
    }

    onClick({ x, y }) {
        if (this.clickable && super.inBoundingBox({ x, y })) {
            this.lastTick = Date.now()    
            this.isSelected = !this.isSelected
            return true
        }
        return false
    }


    setIsSelected({value}) {
        this.isSelected = value
    }

    draw() {
        this.highlight.opacity = lerpOpacity(this.highlight.opacity, 
            (this.isSelected ? .5 : 0), 
            Date.now() - this.lastTick,
            changePerS
        )
        console.log(this.highlight.opacity)
        super.draw()
        this.highlight.draw()
    }
}
