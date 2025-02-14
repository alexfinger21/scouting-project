import DrawableObject from "../DrawableObject.js"

export default class Highlight extends DrawableObject {
    constructor({ctx, renderQueue, img, canvasSize, pos, sX, sY, visible = true, zIndex = 10000}) {
        super({ctx, renderQueue, zIndex, img, x: pos.x, y: pos.y, r: 90, sX , sY: canvasSize.x, visible})
    }
}

