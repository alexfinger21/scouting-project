import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"
import gamePiece from "./GamePiece.js"

export default class Map extends DrawableObject {
    constructor({ctx, img, canvasSize}) {
        consoleLog("map size", canvasSize)
        super({ctx, img, x: 0, y: 0, r:90, sX: canvasSize.x, sY: canvasSize.y})
    }
}
