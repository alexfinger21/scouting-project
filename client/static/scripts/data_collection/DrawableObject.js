export default class {
    constructor(x, y, sX, sY, img, ctx, visible = true) {
        this.x = x        
        this.y = y

        this.sX = sX
        this.sY = sY

        this.img = img        
        this.ctx = ctx

        this.visible = visible
    }

    draw() {
        //this.ctx.save()
        if (this.visible) {
        //drawImage(image, dx, dy, dWidth, dHeight)
        //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            this.ctx.drawImage(this.img, this.x, this.y, this.sX, this.sY)
        }
        //this.ctx.restore()
    }

    
}
