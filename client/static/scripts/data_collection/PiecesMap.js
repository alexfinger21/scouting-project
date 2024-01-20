import DrawableObject from "./DrawableObject.js"
import GamePiece from "./GamePiece.js"

export default class PiecesMap {
    constructor({ctx, allianceColor, img}) {
        console.log("Create pieces")
        this.pieces = new Array(5).fill(new GamePiece({x: 10, y: 10, ctx, img}))
        console.log(this.pieces)
    }

    draw() {
        console.log("Draw piecesMap")
        for(piece in this.pieces) {
            console.log("Drawing piece")
            piece.draw()
        }
    }
 }
