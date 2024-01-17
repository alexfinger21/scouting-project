export default class {
    constructor(x, y, sX, sY, img, ctx) {
        this.x = x        
        this.y = y

        this.sX = sX
        this.sY = sY

        this.img = img        
        this.ctx = ctx        
    }

    draw() {
        this.ctx.save()
        //drawImage(image, dx, dy, dWidth, dHeight)
        //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        this.ctx.drawImage(this.img, this.x, this.y, this.sX, this.sY)
        this.ctx.restore()
    }
}
