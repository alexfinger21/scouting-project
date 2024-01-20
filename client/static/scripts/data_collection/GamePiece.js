import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"

export default class GamePiece extends DrawableObject {
    constructor({x, y, ctx, img, canvasSize}) {
        consoleLog(x, y)
        const size = canvasSize.x * 0.13
        super({ctx, img, x, y, sX: size, sY: size});
    }

    draw() {
        super.draw()
    }
}
