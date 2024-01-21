import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"

const unselectedColor = "#FFFFFF"
const selectedColor = "#F8A90F"

export default class GamePiece extends DrawableObject {
    constructor({ x, y, ctx, img, canvasSize, ge_key }) {
        consoleLog("BBGGGR!!!")
        super({ ctx, img, x, y, sX: canvasSize.x * 0.13, sY: canvasSize.x * 0.13 })

        this.size = canvasSize.x * 0.13

        this.isSelected = false

        this.mask = document.createElement("canvas")
        this.mask.width = this.size
        this.mask.height = this.size

        this.maskCtx = this.mask.getContext("2d")
        this.opacity = 0.1

        this.ge_key = ge_key
    }

    /*changes color of note to match this.isSelected */
    drawMask() {
        this.maskCtx.save()
        this.maskCtx.fillStyle = this.isSelected ? selectedColor : unselectedColor
        this.maskCtx.rect(0, 0, this.size, this.size)
        this.maskCtx.fill()
        this.maskCtx.globalCompositeOperation = "destination-atop"
        this.maskCtx.drawImage(this.img, 0, 0, this.size, this.size)
        this.maskCtx.restore()
    }

    onClick({ x, y }) {
        if (super.inBoundingBox({ x, y })) {
            this.isSelected = !this.isSelected
            this.drawMask()
            this.draw()
            //alert("Selected Note " + this.ge_key)
        }
    }

    draw() {
        this.drawMask()

        this.ctx.save()
        this.ctx.drawImage(this.mask, this.x, this.y, this.sX, this.sY)
        this.ctx.globalCompositeOperation = "multiply"
        this.ctx.restore()

        super.draw()
    }
}
