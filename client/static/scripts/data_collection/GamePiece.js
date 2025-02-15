import { consoleLog, lerp } from "../utility.js"
import DrawableObject from "./DrawableObject.js"

const changePerS = 5

function getColors(color) {
    color = color.substring(4, color.length).split(", ")
    color[2] = color[2].substring(0, color[2].length - 1)

    return color.map(e => Number(e))
}

function lerpColor(current, goal, tickDiff) {
    const [c1, c2, c3] = getColors(current)
    const [g1, g2, g3] = getColors(goal)

    const l1 = Math.min(1, tickDiff/1000*changePerS)
    const l2 = Math.min(1, tickDiff/1000*changePerS)
    const l3 = Math.min(1, tickDiff/1000*changePerS)

    return `rgb(${lerp(c1, g1, isNaN(l1) ? 0 : l1)}, ${lerp(c2, g2, isNaN(l2) ? 0 : l2)}, ${lerp(c3, g3, isNaN(l3) ? 0 : l3)})`
}

export default class GamePiece extends DrawableObject {
    constructor({ x, y, ctx, img, renderQueue, isSelected, canvasSize, ge_key, isBlue, text }) {
        super({ ctx, img, x, y, textSize: canvasSize.x * 0.08, radius: canvasSize.x * 0.045, renderQueue})

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
        )

        //this.drawMask()

        this.ctx.save()
        //this.ctx.drawImage(this.mask, this.x, this.y, this.sX, this.sY)
        //this.ctx.globalCompositeOperation = "multiply"
        this.ctx.restore()

        super.draw()
    }
}
