import { canvasFPS, consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"

export default class Legend extends DrawableObject {
    /* 
    Ctx: canvas.getcontext2dallianceColor: "R" or "B", x: pixels from left
    y: pixels from top
    */
   
    constructor({ctx, img, renderQueue, canvasSize, text}) {
        const x = canvasSize.x * 0.87
        const y = canvasSize.y * 0.05

        super({ctx, renderQueue, img, x, y, r: 90, sX: Math.floor(canvasSize.y * 0.09), sY: Math.floor(canvasSize.y*0.09)})
        this.isSelected = false
        this.text = text
        this.x = x
        this.y = y
        this.canvasSize = canvasSize
    }

    onClick({ x, y }) {
        if (super.inBoundingBox({ x, y })) {
            this.isSelected = !this.isSelected
            return true
        }
        return false
    }

    #getMaxLen(text) {
        let maxLen = 0
        text.forEach((line) => {
            if(line.length > maxLen) {
                maxLen = line.length
            }
        })
        return maxLen
    }

    #drawTextBox() {
        this.ctx.save()

        //calculate bg height
        const text = this.text.split("\n")
        const padY = 10
        const padX = 15
        const width = this.canvasSize.x * 0.8
        const x = this.x - width - padX
        const y = this.y
        const fontSize = Math.floor(width/this.#getMaxLen(text) * 2.1)
        const height = text.length * (fontSize + padY) + padY*2
        this.ctx.fillStyle = "rgba(0,0,0,0.8)"
        this.ctx.fillRect(x, y, width, height)
        this.ctx.fillStyle = "white"
        this.ctx.textAlign = "left"
        this.ctx.font = `${fontSize}px Arial`
        for(let i = 0; i < text.length; i++) {
            this.ctx.fillText(text[i], x + padX, y + (fontSize+padY) * (i+1))
        }

        this.ctx.restore()
    }

    draw() {
        super.draw()
        if(this.isSelected) {
            this.#drawTextBox()
        }
    }
}
