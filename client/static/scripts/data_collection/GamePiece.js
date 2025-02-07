import { consoleLog, lerp } from "../utility.js"
import DrawableObject from "./DrawableObject.js"

const changePerMS = 2

function getColors(color) {
    color = color.substring(4, color.length).split(", ")
    color[2] = color[2].substring(0, color[2].length - 1)

    return color.map(e => Number(e))
}

function lerpColor(current, goal, tickDiff) {
    const [c1, c2, c3] = getColors(current)
    const [g1, g2, g3] = getColors(goal)

    const l1 = Math.min(1, Math.abs((changePerMS*tickDiff)/(g1 - c1)))
    const l2 = Math.min(1, Math.abs((changePerMS*tickDiff)/(g2 - c2)))
    const l3 = Math.min(1, Math.abs((changePerMS*tickDiff)/(g3 - c3)))

    return `rgb(${lerp(c1, g1, isNaN(l1) ? 0 : l1)}, ${lerp(c2, g2, isNaN(l2) ? 0 : l2)}, ${lerp(c3, g3, isNaN(l3) ? 0 : l3)})`
}

export default class GamePiece extends DrawableObject {
    constructor({ x, y, ctx, img, isSelected, canvasSize, ge_key, color, text }) {
        super({ ctx, img, x, y, sX: canvasSize.x * 0.13, sY: canvasSize.x * 0.13 })

        this.size = canvasSize.x * 0.09

        this.isSelected = isSelected

        this.mask = document.createElement("canvas")
        this.mask.width = this.size
        this.mask.height = this.size
        this.color = color
        
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
        this.maskCtx.rect(0, 0, this.size, this.size)
        this.maskCtx.fill()
        this.maskCtx.globalCompositeOperation = "destination-atop"
        this.maskCtx.drawImage(this.img, 0, 0, this.size, this.size)
        this.maskCtx.restore()
    }

    onClick({ x, y }) {
        if (super.inBoundingBox({ x, y })) {

            if (this.spotlightStatus === undefined) {
                this.isSelected = !this.isSelected
            } else {
                if (!this.spotlightStatus) {
                    if (!this.isSelected) {
                        this.isSelected = true
                    } else {
                        this.spotlightStatus = true
                    }
                } else {
                    this.isSelected = false
                    this.spotlightStatus = false
                }

            //alert("Selected Note " + this.ge_key
            }
        }
    }

    draw() {
        //this.color = lerpColor(this.color, this.spotlightStatus ? spotLightColor : (this.isSelected ? selectedColor : unselectedColor) , Date.now() - this.lastTick)
        //this.lastTick = Date.now()
        //this.drawMask()

        this.ctx.save()
        //this.ctx.drawImage(this.mask, this.x, this.y, this.sX, this.sY)
        //this.ctx.globalCompositeOperation = "multiply"
        this.ctx.restore()

        super.draw()
    }
}
