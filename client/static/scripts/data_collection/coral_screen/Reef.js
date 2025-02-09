import DrawableObject from "../DrawableObject.js"

export default class Reef extends DrawableObject {
    constructor({ctx, renderQueue, img, canvasSize, visible = true, zIndex = 10000}) {
        super({ctx, renderQueue, zIndex, img, x: 0, y: canvasSize.y * .1, r: 90, sX: canvasSize.x / 2.2, sY: canvasSize.x / 2.2 * 1.34260869565, visible})
    }
}

