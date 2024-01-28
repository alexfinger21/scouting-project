import { consoleLog } from "../utility.js"

export default class DrawableObject {
    constructor({ctx, x, y, sX, sY, r, img, visible = true}) {
        this.x = x        
        this.y = y

        this.sX = sX
        this.sY = sY

        this.img = img        
        this.ctx = ctx

        this.visible = visible
        this.r = (r ?? 91) * Math.PI / 180
        this.prevTick = Date.now()
    }

    /*Return true if x, y position is in object*/
        inBoundingBox({x, y}) {
            //consoleLog("pos: ", x, y)
            if ((y > this.y) && (y < this.y + this.sY) && (x > this.x) && (x < this.x + this.sX)) {
                return true
            }
        }

    rotate() {
        const a = this.r 
        const x = Math.cos(a) * 1/2 * this.sY - Math.cos(Math.PI/2 - a) * 1/2 * this.sX
        const y = Math.sin(a) * 1/2 * this.sY + Math.sin(Math.PI/2 - a) * 1/2 * this.sX

        this.ctx.translate(x, -y)
        this.ctx.rotate(-a + Math.PI/2) //add rotation
    }

    draw() {
        if (this.visible) {
            this.ctx.save()
            this.ctx.globalAlpha = this.opacity ?? 1
            //drawImage(image, dx, dy, dWidth, dHeight)
            //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)

            //move here, so rotation doesnt affect x and y

            this.ctx.translate(this.x+this.sX/2, this.y+this.sY/2)
            this.rotate()
            this.ctx.drawImage(this.img, 0, 0, this.sX, this.sY) //do not use x and y here to support rotation
            //1this.ctx.translate(-1*this.x, -1*this.y)//move back
            this.ctx.restore()
        }
    }


} 
