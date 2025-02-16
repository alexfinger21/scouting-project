import { consoleLog, lerp } from "../../utility.js"
import DrawableObject from "../DrawableObject.js"

const msToAnimate = 100

export default class ProceedBtn extends DrawableObject {
    constructor({ctx, x, y, sX, sY, zIndex, imgs, renderQueue}) {
        super({ctx, x, y, sX, sY, zIndex, renderQueue, img: imgs.proceedBtnImage})
        consoleLog(imgs)
        
        this.isSelected = false
        this.prevTick = Date.now()

        this.unSelectedSX = sX
        this.unSelectedSY = sY
        this.selectedSX = sX*0.9
        this.selectedSY = sY*0.9

        this.lastTick = Date.now()

        // add a mask
    }

    onClick({x, y}) {
        if ((this.x - this.sX/2 <= x && this.x + this.sX/2 >= x) && (this.y - this.sY/2 <= y && this.y + this.sY/2)) {
            this.lastTick = Date.now()
            this.isSelected = !this.isSelected
            return true
        }
        return false
    }

    draw() {
        if (this.isSelected) {
            this.sX = lerp(this.unSelectedSX, this.selectedSX, Math.min(1, (Date.now() - this.lastTick)/msToAnimate))
            this.sY = lerp(this.unSelectedSY, this.selectedSY, Math.min(1, (Date.now() - this.lastTick)/msToAnimate))
        } else {
            this.sX = lerp(this.selectedSX, this.unSelectedSX, Math.min(1, (Date.now() - this.lastTick)/msToAnimate))
            this.sY = lerp(this.selectedSY, this.unSelectedSY, Math.min(1, (Date.now() - this.lastTick)/msToAnimate))
        }
        super.draw()
    }

    render() {
        this.ctx.save()
        this.ctx.globalAlpha = this.opacity
        //drawImage(image, dx, dy, dWidth, dHeight)
        //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)

        //move here, so rotation doesnt affect x and y

        this.ctx.translate(this.x*this.dpr, this.y*this.dpr)

        this.rotate()
        this.ctx.drawImage(this.img, 0, 0, this.sX*this.dpr, this.sY*this.dpr) //do not use x and y here to support rotation

        this.ctx.restore()
    }
}
