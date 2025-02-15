import DrawableObject from "../DrawableObject.js"

export default class Letter extends DrawableObject {
    constructor({ctx, renderQueue, text, canvasSize, pos, zIndex}) {
        super({ctx, renderQueue, text, img: "circle", r: 90, x: 150, y: 50, radius: 30, canvasSize, pos, zIndex})
    }

    draw() {
        super.draw()
    }
}
