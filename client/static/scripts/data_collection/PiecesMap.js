import DrawableObject from "./DrawableObject.js"
import GamePiece from "./GamePiece.js"

export default class PiecesMap extends DrawableObject {
    constructor({ctx, allianceColor, img}) {
        super({ctx, img, x: 0, y: 0, sX: 200, sY: 200})
        this.pieces = new Array(5).fill(new GamePiece({x: 10, y: 10, ctx, img}))
    }

    draw() {
        super.draw()
    }
}
