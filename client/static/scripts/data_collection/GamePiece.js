import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"

export default class GamePiece extends DrawableObject {
    constructor({x, y, ctx, img, canvasSize, ge_key}) {
        consoleLog(x, y)
        const size = canvasSize.x * 0.13
        super({ctx, img, x, y, sX: size, sY: size});
        this.ge_key = ge_key
    }

    onClick({x, y}) {
        if(super.inBoundingBox({x, y})) {
            alert("Selected Note " + this.ge_key)
        }
    }

    draw() {
        super.draw()
    }
}
