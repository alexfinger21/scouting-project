import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"
import GamePiece from "./GamePiece.js"

export default class PiecesMap {
    constructor({ ctx, allianceColor, img, pieceData, canvasSize }) {
        console.log("Create pieces")
        console.log(canvasSize)
        this.pieces = []
        const isBlue = allianceColor == "B" 
        //Add Pickup Wing Notes ge_key 202-204
        const wingNoteX = isBlue ? Math.floor(canvasSize.x * 0.35) : Math.floor(canvasSize.x * 0.52)
        const centerNoteX = isBlue ? Math.floor(canvasSize.x * 0.8) : Math.floor(canvasSize.x * 0.05)

        //Wing Notes
        for (let i = 0; i < 3; i++) {
            const idx = 202 + i
            if (idx in pieceData) {
                this.pieces.push(new GamePiece({
                    x: wingNoteX,
                    y: canvasSize.y * 0.1 + Math.floor(canvasSize.y * 0.18 * i),
                    ctx,
                    img,
                    isSelected: pieceData[idx],
                    ge_key: idx, canvasSize
                }))
            }
        }

        //Center Notes
        for (let i = 0; i < 5; i++) {
            const idx = 205 + i
            if (idx in pieceData) {
                this.pieces.push(new GamePiece({
                    x: centerNoteX,
                    y: canvasSize.y * 0.1 + Math.floor(canvasSize.y * 0.18 * i),
                    ctx,
                    img,
                    isSelected: pieceData[idx],
                    ge_key: idx,
                    canvasSize,
                }))
            }
        }

        //Splotlight notes moving clockwise
        if ("210" in pieceData) { //leftmost spotlight
            this.pieces.push(new GamePiece({
                x: isBlue ? canvasSize.x * 0.48 : canvasSize.x * 0.21,
                y: isBlue ? canvasSize.y * 0.35 : canvasSize.y * 0.44,
                ctx,
                img,
                isSelected: pieceData["210"],
                ge_key: 210,
                canSpotlight: true,
                canvasSize 
            }))
        }
        if ("211" in pieceData) { //rightmost spotlight
            this.pieces.push(new GamePiece({
                x: isBlue ? canvasSize.x * 0.65 : canvasSize.x * 0.38,
                y: isBlue ? canvasSize.y * 0.44 : canvasSize.y * 0.34,
                ctx,
                img,
                isSelected: pieceData["211"],
                ge_key: 211,
                canSpotlight: true,
                canvasSize 
            }))
        }
        if ("212" in pieceData) { //bottommost spotlight
            this.pieces.push(new GamePiece({
                x: isBlue? canvasSize.x * 0.49: canvasSize.x*0.38,
                y: isBlue? canvasSize.y * 0.53: canvasSize.y*0.53,
                ctx,
                img,
                isSelected: pieceData["212"],
                ge_key: 212,
                canSpotlight: true,
                canvasSize 
            }))
        }


        //console.log(this.pieces)
    }

    onClick({ x, y }) {
        this.pieces.forEach(function (piece) {
            piece.onClick({ x, y })
        })
    }

    sendData() {
        const data = {}

        for (const x of this.pieces) {
            data[x.ge_key] = x.isSelected
        }

        return data
    }

    draw() {
        this.pieces.forEach(function (piece) {
            piece.draw()
        })
    }
}
