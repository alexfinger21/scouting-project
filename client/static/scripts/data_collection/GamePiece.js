import DrawableObject from "./DrawableObject.js"

export default class GamePiece extends DrawableObject {
    constructor({x, y, ctx, img, canvasSize, ge_key}) {
        super({ctx, img, x, y, sX: canvasSize.x * 0.13, sY: canvasSize.x * 0.13})

        this.size = canvasSize.x * 0.13

        this.mask = document.createElement("canvas")
        this.mask.width = this.size
        this.mask.height = this.size

        this.maskCtx = this.mask.getContext("2d")
        this.maskCtx.fillStyle = "#F8A90F"
        this.maskCtx.rect(0, 0, this.size, this.size)
        this.maskCtx.fill()

        this.maskCtx.globalCompositeOperation = "destination-atop"
        this.maskCtx.drawImage(this.img, 0, 0, this.size, this.size)
        this.opacity = 0.1
        this.ge_key = ge_key
    
    }

    onClick({x, y}) {
        if(super.inBoundingBox({x, y})) {
            alert("Selected Note " + this.ge_key)
        }
    }

    draw() {
        this.ctx.save()
        this.ctx.drawImage(this.mask, this.x, this.y, this.sX, this.sY)
        this.ctx.globalCompositeOperation = "multiply"
        this.ctx.restore()
        super.draw()
    }
}
