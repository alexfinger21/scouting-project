import DrawableObject from "../DrawableObject.js"

export default class ProceedBtn extends DrawableObject {
    constructor({x, y, sX, sY, zIndex, imgs}) {
        super({x, y, sX, sY, zIndex, img: imgs.proceedBtnImage})
        
        this.isSelected = false
        this.prevTick = Date.now()

        // add a mask
    }

    onClick({x, y}) {
        if (super.inBoundingBox({x, y})) {
            this.isSelected = true
        }
    }

    draw() {
        //render mask
    }
}
