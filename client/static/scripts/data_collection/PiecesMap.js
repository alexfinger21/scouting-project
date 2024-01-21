import DrawableObject from "./DrawableObject.js"
import GamePiece from "./GamePiece.js"

export default class PiecesMap {
    constructor({ctx, allianceColor, img, canvasSize}) {
        console.log("Create pieces")
        console.log(canvasSize)
        this.pieces = new Array(8)
        //Add Pickup Wing Notes ge_key 202-204
        const wingNoteX = allianceColor == "B" ? Math.floor(canvasSize.x*0.3) : Math.floor(canvasSize.x*0.65)
        const centerNoteX = allianceColor == "B" ? Math.floor(canvasSize.x*0.8) : Math.floor(canvasSize.x*0.05)
        for(let i = 0; i < 3; i++) {
            this.pieces[i] = new GamePiece({x: wingNoteX, y: canvasSize.y*0.17 + Math.floor(canvasSize.y*0.18*i), ctx, img, ge_key: 202+i, canvasSize})
        }
        for(let i = 0; i < 5; i++) {
            this.pieces[3+i] = new GamePiece({x: centerNoteX, y: canvasSize.y*0.1+Math.floor(canvasSize.y*0.18*i), ctx, img, ge_key: 205+i, canvasSize})
        }
        console.log(this.pieces)
    }

    onClick({x, y}) {
        this.pieces.forEach(function(piece) {
            piece.onClick({x, y})
        })
    }

    draw() {
        this.pieces.forEach(function(piece) {
            piece.draw()
        }) 
    }
 }
