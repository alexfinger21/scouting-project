import DrawableObject from "../DrawableObject"

export default class Reef extends DrawableObject {
    constructor({ctx, img, canvasSize, visible = true, zIndex = 0}) {
        super({ctx, img, x: 0, y: 0, r: 0, sX: canvasSize.x, sY: canvasSize.y, visible, zIndex})
    }
}

