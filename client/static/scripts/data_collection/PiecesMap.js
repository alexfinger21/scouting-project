import DrawableObject from "./DrawableObject";
import GamePiece from "./GamePiece";

export default class PiecesMap extends DrawableObject {
    constructor({ctx, allianceColor, img}) {
        this.pieces = new Array(gamePieces ?? 5).fill(new gamePiece({x: 10, y: 10, ctx, img}))
        super(ctx, x, y, allianceColor)
    }

    draw() {
        super.draw()
    }
}