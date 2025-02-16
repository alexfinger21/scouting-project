import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"
import GamePiece from "./GamePiece.js"

export default class PiecesMap {
    constructor({ ctx, allianceColor, img, pieceData, renderQueue, canvasSize, isAuton}) {
        console.log("Create pieces")
        console.log(canvasSize)
        this.renderQueue = renderQueue
        this.pieces = []
        const isBlue = allianceColor == "B" 
        //Add Pickup Wing Notes ge_key 202-204
        //Wing Notes
        if (isAuton) {
            const dist = canvasSize.x * 0.25
            const startAng = Math.PI/11
            const ctr = [canvasSize.x * 0.56, canvasSize.y * 0.47]
            for (let i = 0; i < 12; ++i) {
                this.pieces.push(new GamePiece({
                    x: ctr[0] + dist*Math.cos(startAng - Math.PI/6*i),
                    y: ctr[1] + dist*Math.sin(startAng - Math.PI/6*i),
                    ctx,
                    img,
                    renderQueue, 
                    isSelected: false,
                    ge_key: 125,
                    text: String.fromCharCode(65+i),
                    isBlue,
                    zIndex: 2,
                    canvasSize
                }))  
            }
        }

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
                zIndex: 2,
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
        let res = null
        this.pieces.forEach(function(piece) {
            if (!res && piece.onClick({ x, y })) {
                res = piece
            }
        })

        return res ?? false
    }

    sendData() {
        const data = {}

        for (const x of this.pieces) {
            const val =  x.spotlightStatus ? 2 : (x.isSelected ? 1 : 0)
            data[x.ge_key] = val            
        }

        return data
    }

    draw() {
        this.pieces.forEach(function (piece) {
            piece.draw()
        })
    }
}
