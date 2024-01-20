import DrawableObject from "./DrawableObject.js"

export default class GamePiece extends DrawableObject {
    constructor({x, y, ctx, img}) {
        super({ctx, img, x, y, sX: 100, sY: 100});
    }

    draw() {
        super.draw()
    }
}
