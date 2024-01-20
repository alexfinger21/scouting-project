import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"
import gamePiece from "./GamePiece.js"

export default class AutonMap extends DrawableObject {
    constructor({ctx, img}) {
        
        super({ctx, img, x: 0, y: 0, sX: 600, sY: 200})

    }

    draw() {
        super.draw()
    }
}
