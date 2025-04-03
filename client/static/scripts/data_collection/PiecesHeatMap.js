import { consoleLog, lerpColor } from "../utility.js"
import DrawableObject from "./DrawableObject.js"
import GamePiece from "./GamePiece.js"

export default class PiecesHeatMap {
    constructor({ ctx, allianceColor, data, img, renderQueue, canvasSize }) {
        this.renderQueue = renderQueue
        this.pieces = []
        const isBlue = allianceColor == "B" 
        //Add Pickup Wing Notes ge_key 202-204
        //Wing Notes
        const dist = canvasSize.x * 0.25
        const startAng = Math.PI/11
        const ctr = isBlue ? [canvasSize.x * 0.56, canvasSize.y * 0.47] : [canvasSize.x * 0.333, canvasSize.y * 0.4235]
        for (let i = 0; i < 12; ++i) {
            this.pieces.push(new GamePiece({
                x: ctr[0] + dist*Math.cos(startAng - Math.PI/6*i),
                y: ctr[1] + dist*Math.sin(startAng - Math.PI/6*i),
                ctx,
                img,
                color: lerpColor("rgb(59, 134, 205)", "rgb(205, 59, 59)", 1000, 0),
                renderQueue, 
                isSelected: false,
                ge_key: 125,
                text: String.fromCharCode(allianceColor == "B" ? 65+i : 76-i),
                isBlue,
                zIndex: 2,
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

    draw() {
        this.pieces.forEach(function (piece) {
            piece.draw()
        })
    }
}
