import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"
import GamePiece from "./GamePiece.js"

export default class PiecesMap {
    constructor({ ctx, allianceColor, img, pieceData, canvasSize, isAuton}) {
        console.log("Create pieces")
        console.log(canvasSize)
        this.pieces = []
        const isBlue = allianceColor == "B" 
        //Add Pickup Wing Notes ge_key 202-204
        const wingNoteX = isBlue ? Math.floor(canvasSize.x * 0.35) : Math.floor(canvasSize.x * 0.52)
        const centerNoteX = isBlue ? Math.floor(canvasSize.x * 0.8) : Math.floor(canvasSize.x * 0.05)

        //Wing Notes
        if (isAuton) {
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
        }

        //Center Notes
        if (isAuton) {
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
        }
        consoleLog("RECEIVED PIECES", pieceData["403"])
        consoleLog(pieceData)
        //Splotlight notes moving top-down
        if ("403" in pieceData && !isAuton) { //topmost spotlight
            this.pieces.push(new GamePiece({
                x: isBlue ? canvasSize.x * 0.51 : canvasSize.x * 0.25,
                y: isBlue ? canvasSize.y * 0.37 : canvasSize.y * 0.44,
                ctx,
                img,
                isSelected: pieceData["403"] > 0,
                spotlightStatus: pieceData["403"] == 2,
                ge_key: 403,
                canSpotlight: true,
                canvasSize 
            }))
        }
        if ("404" in pieceData && !isAuton) { //middle spotlight
            this.pieces.push(new GamePiece({
                x: isBlue ? canvasSize.x * 0.62 : canvasSize.x * 0.36,
                y: isBlue ? canvasSize.y * 0.44 : canvasSize.y * 0.36,
                ctx,
                img,
                isSelected: pieceData["404"] > 0,
                spotlightStatus: pieceData["404"] == 2,
                ge_key: 404,
                canSpotlight: true,
                canvasSize 
            }))
        }
        if ("405" in pieceData && !isAuton) { //bottommost spotlight
            this.pieces.push(new GamePiece({
                x: isBlue? canvasSize.x * 0.51: canvasSize.x*0.37,
                y: isBlue? canvasSize.y * 0.50: canvasSize.y*0.5,
                ctx,
                img,
                isSelected: pieceData["405"] > 0,
                spotlightStatus: pieceData["405"] == 2,
                ge_key: 405,
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
            data[x.ge_key] = x.spotlightStatus ? 2 : (x.isSelected ? 1 : 0)
        }

        return data
    }

    draw() {
        this.pieces.forEach(function (piece) {
            piece.draw()
        })
    }
}
