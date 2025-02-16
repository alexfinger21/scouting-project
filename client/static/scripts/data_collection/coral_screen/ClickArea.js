import { consoleLog, lerpColor, lerpOpacity } from "../../utility.js"
import DrawableObject from "../DrawableObject.js"

const changePerS = 10
const maxValue = 3

function getOpacity(value) {
    return value > 0 ? 0.5 : 0
}

function getColor(value) {
    switch(value) {
        case 0:
            return "rgb(255, 251, 126)"
        case 1:
            return "rgb(255, 251, 126)"
        case 2:
            return "rgb(237, 57, 34)"
    }
}

export default class ClickArea extends DrawableObject {
    /* 
    Ctx: canvas.getcontext2dallianceColor: "R" or "B", x: pixels from left
    y: pixels from top
    */
   
    constructor({ctx, value, img, renderQueue, containerImg, isSelected, canvasSize, pos, zIndex}) {
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
        this.value = value ?? 0 //val 0: not attempted 
        //val 1: scored 1 coral
        //val 2: tried to score coral and missed

        this.highlight = new DrawableObject({ctx, renderQueue, zIndex: zIndex-0.5, x, y, sX, sY, r: 90, img: "rectangle", opacity: 0.5})
        this.highlight.color = getColor(this.value)
        

        this.renderQueue = renderQueue

        this.highlight.opacity = this.value ? 0 : .5

        this.lastTick = Date.now()    
    }

    onClick({ x, y }) {
        if (super.inBoundingBox({ x, y })) {
            this.lastTick = Date.now()   
            this.value = (this.value + 1) % (maxValue)
            return true
        }
        return false
    }


    setValue({value}) {
        this.value = Math.min(value, maxValue)
    }

    draw() {
        this.highlight.opacity = lerpOpacity(this.highlight.opacity, 
            (getOpacity(this.value)), 
            Date.now() - this.lastTick,
            changePerS
        )
        consoleLog(this.value,this.highlight.color)
        this.highlight.color = lerpColor(this.highlight.color,
            getColor(this.value),
            Date.now() - this.lastTick,
            changePerS
        )
        super.draw()
        this.highlight.draw()
    }
}
