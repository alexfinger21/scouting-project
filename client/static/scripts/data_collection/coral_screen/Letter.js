import DrawableObject from "../DrawableObject.js"

export default class Letter extends DrawableObject {
    constructor({ctx, renderQueue, text, color, canvasSize, pos, zIndex}) {
        super({ctx, renderQueue, text, img: "circle", r: 90, x: pos.x, textSize:Math.round(canvasSize.x/25) , y: pos.y, radius: canvasSize.x * 0.02, canvasSize, pos, zIndex})
        this.color = color
    }

    draw() {
        super.draw()
    }
}
