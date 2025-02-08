import DrawableObject from "../DrawableObject"

export default class GUI extends DrawableObject {
    constructor({ctx, x, y, sX, sY, r, visible = true, zIndex = 0, img = null}) {
        this.ctx = ctx
        this.x = x
        this.y = y
        this.sX = sX
        this.sY = sY

        this.render = new DrawableObject({ctx, x, y, sX, sY, r, img, visible, zIndex})

        if (this.img) {
            this.img = img
        }

        this.children = []
    }

    draw() {
        
    }
}
