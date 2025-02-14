import DrawableObject from "../DrawableObject.js"

export default class Letter extends DrawableObject {
    constructor({ctx, renderQueue, text, canvasSize, pos, zIndex = 10000}) {
        super({ctx, renderQueue, text, img: "circle", r: 90, sX: 50, sY: 50, radius: 30, canvasSize, pos, zIndex})
    }

    draw() {
        console.log("sigma", this.zIndex)
        super.draw()
    }
}