import { consoleLog } from "../utility.js"

export default class DrawableObject {
    constructor({ctx, x, y, sX, sY, img, visible = true}) {
        this.x = x        
        this.y = y

        this.sX = sX
        this.sY = sY

        this.img = img        
        this.ctx = ctx

        this.visible = visible
    }

    /*Return true if x, y position is in object*/
    inBoundingBox({x, y}) {
        consoleLog("pos: ", x, y)
        if ((y > this.y) && (y < this.y + this.sY) && (x > this.x) && (x < this.x + this.sX)) {
            return true
        }
    }

    draw() {
        if (this.visible) {
        //drawImage(image, dx, dy, dWidth, dHeight)
        //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            this.ctx.drawImage(this.img, this.x, this.y, this.sX, this.sY)
        }
        this.ctx.save()
        //this.ctx.restore()
    }

    
}
