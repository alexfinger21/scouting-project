import DrawableObject from "./DrawableObject.js"
import GamePiece from "./GamePiece.js"

export default class PiecesMap {
    constructor({ctx, allianceColor, img, canvasSize}) {
        console.log("Create pieces")
        console.log(canvasSize)
        this.pieces = new Array(8)
        //Add Pickup Wing Notes ge_key 202-204
        for(let i = 0; i < 3; i++) {
            this.pieces[i] = new GamePiece({x: Math.floor(canvasSize.x*0.25), y: canvasSize.y*0.1 + Math.floor(canvasSize.y*0.18*i), ctx, img, ge_key: 202+i, canvasSize})
        }
        for(let i = 0; i < 5; i++) {
            this.pieces[3+i] = new GamePiece({x: Math.floor(canvasSize.x*0.8), y: canvasSize.y*0.1+Math.floor(canvasSize.y*0.18*i), ctx, img, ge_key: 205+i, canvasSize})
        }
        console.log(this.pieces)
    }

    onClick({x, y}) {
        this.pieces.forEach(function(piece) {
            piece.onClick({x, y})
        })
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
