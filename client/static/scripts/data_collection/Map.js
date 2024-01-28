import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"
import gamePiece from "./GamePiece.js"

export default class Map extends DrawableObject {
    constructor({ctx, img, canvasSize}) {
        super({ctx, img, x: 0, y: 0, sX: Math.min(canvasSize.x, canvasSize.y), sY: Math.min(canvasSize.x, canvasSize.y)})
    }
}
