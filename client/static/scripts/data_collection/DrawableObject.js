import { consoleLog } from "../utility.js"

function rotateAtCenterPivot(angle, x, y) {

}

export default class DrawableObject {
    constructor({ctx, x, y, sX, sY, r, img, visible = true}) {
        this.x = x        
        this.y = y

        this.sX = sX
        this.sY = sY

        this.img = img        
        this.ctx = ctx

        this.visible = visible
        this.r = (r ? r : 0) * Math.PI / 180
    }

    /*Return true if x, y position is in object*/
    inBoundingBox({x, y}) {
        //consoleLog("pos: ", x, y)
        if ((y > this.y) && (y < this.y + this.sY) && (x > this.x) && (x < this.x + this.sX)) {
            return true
        }
    }

    rotate() {
        this.ctx.translate(1/2*this.sY*Math.cos(this.r) + 1/2*this.sX*Math.sin(this.r), 1/2*this.sY*Math.sin(this.r) + 1/2*this.sX*Math.cos(this.r))
    }

    draw() {
        if (this.visible) {
            this.ctx.save()
            this.ctx.globalAlpha = this.opacity ?? 1
            //drawImage(image, dx, dy, dWidth, dHeight)
            //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)

            this.ctx.translate(this.x, this.y)//move here, so rotation doesnt affect x and y
            this.ctx.rotate(this.r) //add rotation
            this.rotate()
            this.ctx.drawImage(this.img, 0, 0, this.sX, this.sY) //do not use x and y here to support rotation
            this.ctx.rotate(-1*this.r) //rotate back
            this.ctx.translate(-1*this.x, -1*this.y)//move back

            this.ctx.restore()
        }
    }

    
}
