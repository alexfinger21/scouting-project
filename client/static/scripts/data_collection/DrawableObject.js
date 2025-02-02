import { consoleLog } from "../utility.js"

export default class DrawableObject {
    constructor({ctx, x, y, sX, sY, r, img, visible = true}) {
        this.dpr = window.devicePixelRatio
        // dpr necessary to increase render resolution

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
        /*const topBounds = this.y + Math.sin(this.r)*this.sY/2 + Math.tan(this.r) * (this.x - Math.cos(this.r) * this.sY/2)
        
        //consoleLog("pos: ", x, y)
        if(this.r < 75) {
            consoleLog("R: ", this.r < 75 * 180/Math.PI, " Top bound: ", topBounds, " Click pos: ", y, " Passed: ", y < topBounds)
        } */
        if ((y > this.y) && (y < this.y + this.sY) && (x > this.x) && (x < this.x + this.sX)) {
            return true
        }
        return false
    }

    rotate() {
        const a = this.r 
        //rotate code
        const x = Math.cos(a) * 1/2 * this.sY*this.dpr - Math.cos(Math.PI/2 - a) * 1/2 * this.sX*this.dpr
        const y = Math.sin(a) * 1/2 * this.sY*this.dpr + Math.sin(Math.PI/2 - a) * 1/2 * this.sX*this.dpr

        if (a == Math.PI/4) {
            consoleLog(x, y)
        }
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

            this.ctx.translate((this.x+this.sX/2)*this.dpr, (this.y+this.sY/2)*this.dpr)
            this.rotate()
            this.ctx.drawImage(this.img, 0, 0, this.sX*this.dpr, this.sY*this.dpr) //do not use x and y here to support rotation
            //1this.ctx.translate(-1*this.x, -1*this.y)//move back
            this.ctx.restore()
        }
    }
} 
