import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"
import gamePiece from "./gamePiece.js"

export default class AutonMap extends DrawableObject {
    constructor({x, y, ctx, allianceColor}) {
        const img = new Image()

        if (allianceColor == "B") {
           // img.src = "../../../images/data-collection/game-map-blue.png"
        } else {
           // img.src = "../../../images/data-collection/game-map-blue.png"
        }
        
        super({ctx, img, x, y, sX: 600, sY: 200})

    }

    draw() {
        super.draw()
    }
}
