import DrawableObject from "../DrawableObject.js"
import Letter from "./Letter.js"

export default class Reef extends DrawableObject {
    constructor({ctx, renderQueue, images, letter, canvasSize, pos, visible = true, zIndex}) {
        const ch = letter.charCodeAt(0)
        super({ctx, renderQueue, zIndex, img: (ch % 2) ? images.reefLeftImage : images.reefRightImage, x: pos.x, y: pos.y, r: 90, sX: canvasSize.x / 2.2, sY: canvasSize.x / 2.2 * 1.34260869565, visible})
        this.letters = []
        let idx = 0
        let leftAligned = (ch % 2)
        for(let i = ch - (leftAligned ? 3 : 2); i < ch + (leftAligned ? 3 : 4); i++ ) {
            console.log(String.fromCharCode(i))
            this.letters.push(new Letter({ctx, renderQueue, text: String.fromCharCode(i), zIndex: zIndex+5, canvasSize, pos: {
                x: pos.x + canvasSize.x * 0.055 * (i < ch + leftAligned ? 1 : 1.95) + canvasSize.x * 0.05 * idx,
                y: pos.y + canvasSize.y * 0.02 ,
            }}))
            idx++
        }

    }

    draw() {
        super.draw()
        for(const l of this.letters) {
            l.draw()
        }
    }
}

