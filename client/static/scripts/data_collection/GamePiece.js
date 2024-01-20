import DrawableObject from "./DrawableObject.js"

export default class GamePiece extends DrawableObject {
    constructor({x, y, ctx, img}) {
        super({ctx, img, x, y, sX: 200, sY: 200});
    }
}
