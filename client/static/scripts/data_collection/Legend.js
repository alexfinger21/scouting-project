import { canvasFPS, consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"

export default class Legend extends DrawableObject {
    /* 
    Ctx: canvas.getcontext2dallianceColor: "R" or "B", x: pixels from left
    y: pixels from top
    */
   
    constructor({ctx, img, renderQueue, canvasSize, text}) {
        const x = canvasSize.x * 0.86
        const y = canvasSize.y * 0.10

        super({ctx, renderQueue, img, x, y, r: 90, sX: Math.floor(canvasSize.y * 0.11), sY: Math.floor(canvasSize.y*0.11), zIndex: Infinity})

        this.isSelected = false
        this.text = text
        this.canvasSize = canvasSize
    }

    onClick({ x, y }) {
        if (super.inBoundingBox({ x, y })) {
            consoleLog("pressed legend")
            this.isSelected = !this.isSelected
            return true
        }
        return false
    }

    #getMaxLen(text) {
        let maxLen = 0

        text.forEach((line) => {
            maxLen = Math.max(line.length, maxLen)
        })

        return maxLen
    }

    #drawTextBox() {
        this.ctx.save()

        //calculate bg height
        const text = this.text.split("\n")
        const padY = 10
        const padX = 5
        const width = this.canvasSize.x * 0.8
        const x = this.x - width 
        const y = this.y
        const fontSize = Math.floor(width/this.#getMaxLen(text) * 2.3)
        const height = text.length * (fontSize + padY) + padY*2
        this.ctx.fillStyle = "rgba(0,0,0,0.8)"
        this.ctx.fillRect(x*this.dpr, y*this.dpr, width*this.dpr, height*this.dpr)
        this.ctx.fillStyle = "white"
        this.ctx.textAlign = "left"
        this.ctx.font = `${fontSize*this.dpr}px Arial`
        for(let i = 0; i < text.length; i++) {
            this.ctx.fillText(text[i], (x + padX)*this.dpr, (y + (fontSize+padY) * (i+1))*this.dpr)
        }

        this.ctx.restore()
    }

    draw() {
        super.draw()
    }

    render() {
        super.render()
        if (this.isSelected) {
            this.#drawTextBox()
        }

    }
}
