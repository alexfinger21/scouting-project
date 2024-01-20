import DrawableObject from "./DrawableObject.js"
import GamePiece from "./GamePiece.js"

export default class PiecesMap {
    constructor({ctx, allianceColor, img}) {
        console.log("Create pieces")
        
        this.pieces = [
            new GamePiece({x: 10, y: 10, ctx, img, ge_key: 202}), //Pickup Wing Note 1
            new GamePiece({x: 10, y: 30, ctx, img, ge_key: 203}), //Pickup Wing Note 2
            new GamePiece({x: 10, y: 50, ctx, img, ge_key: 204}), //Pickup Wing Note 3
        ]
        console.log(this.pieces)
    }

    draw() {
        console.log("Draw piecesMap")
        this.pieces.forEach(function(piece) {
            console.log("Drawing piece")
            console.log(piece)
            piece.draw()
        }) 
    }
 }
