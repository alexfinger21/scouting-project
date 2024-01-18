import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"
import gamePiece from "./gamePiece.js"

export default class AutonMap extends DrawableObject {
    constructor({x, y, ctx, allianceColor, gamePieces}) {
        const img = new Image()

        if (allianceColor == "B") {
           // img.src = "../../../images/data-collection/game-map-blue.png"
        } else {
           // img.src = "../../../images/data-collection/game-map-blue.png"
        }
        
        super({ctx, img, x, y, sX: 600, sY: 200})

        this.pieces = new Array(gamePieces ?? 5).fill(new gamePiece({x: 10, y: 10, ctx}))
    }

    draw() {
        super.draw()

        this.ctx.fillRect(10, 10, 10, 10)

        for (const piece of this.pieces) {
            consoleLog(piece)
            piece.draw()
        }
    }
}
