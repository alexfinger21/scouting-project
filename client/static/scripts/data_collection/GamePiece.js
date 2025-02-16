import { consoleLog, lerpColor } from "../utility.js"
import DrawableObject from "./DrawableObject.js"

const changePerS = 5

export default class GamePiece extends DrawableObject {
    constructor({ x, y, ctx, img, renderQueue, isSelected, canvasSize, ge_key, isBlue, text }) {
        super({ ctx, img, x, y, textSize: Math.round(canvasSize.x * 0.04), radius: canvasSize.x * 0.045, renderQueue})

        this.isSelected = isSelected

        this.mask = document.createElement("canvas")
        this.mask.width = this.radius
        this.mask.height = this.radius
        this.team = isBlue ? "blue" : "red"
        this.color = isBlue ? "rgb(59, 134, 205)" : "rgb(255, 43, 43)"
        this.selectedColor = isBlue ? "rgb(150, 150, 150)" : "rgb(0, 0, 0)"
        this.unselectedColor = this.color

        this.maskCtx = this.mask.getContext("2d")
        this.opacity = 1
        this.text = text

        this.lastTick = Date.now()    

        this.ge_key = ge_key
    }

    /*changes color of note to match this.isSelected */
    drawMask() {
        this.maskCtx.save()
        this.maskCtx.fillStyle = this.color
        this.maskCtx.rect(0, 0, this.radius, this.radius)
        this.maskCtx.fill()
        this.maskCtx.globalCompositeOperation = "destination-atop"
        this.maskCtx.drawImage(this.img, 0, 0, this.radius, this.radius)
        this.maskCtx.restore()
    }

    onClick({ x, y }) {
        if (super.inBoundingRadius({ x, y })) {
            this.lastTick = Date.now()
            this.isSelected = !this.isSelected
        }
    }

    draw() {
        this.color = lerpColor(this.color, 
            (this.isSelected ? this.selectedColor : this.unselectedColor), 
            Date.now() - this.lastTick,
            changePerS
        )

        //this.drawMask()

        this.ctx.save()
        //this.ctx.drawImage(this.mask, this.x, this.y, this.sX, this.sY)
        //this.ctx.globalCompositeOperation = "multiply"
        this.ctx.restore()

        super.draw()
    }
}
