import DrawableObject from "../DrawableObject.js"
import Letter from "./Letter.js"

export default class Reef extends DrawableObject {
    constructor({ctx, renderQueue, images, letter, canvasSize, pos, visible = true, zIndex}) {
        const ch = letter.charCodeAt(0)
        super({ctx, renderQueue, zIndex, img: (ch % 2) ? images.reefLeftImage : images.reefRightImage, x: pos.x, y: pos.y, r: 90, sX: canvasSize.x / 2.2, sY: canvasSize.x / 2.2 * 1.34260869565, visible})
        this.letters = []
        let idx = 0
        for(let i = ch - ((ch % 2) ? 3 : 2); i < ch + ((ch % 2) ? 2 : 3); i++ ) {
            console.log(String.fromCharCode(i))
            this.letters.push(new Letter({ctx, renderQueue, text: String.fromCharCode(i), zIndex: zIndex+5, canvasSize, pos: {
                x: pos.x + canvasSize.x * 0.15 * idx,
                y: pos.y + canvasSize.y * 0.1,
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

