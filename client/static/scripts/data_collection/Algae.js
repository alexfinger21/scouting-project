import DrawableObject from "./DrawableObject.js"

export default class Algae extends DrawableObject {
    constructor({ctx, renderQueue, images, isSelected=false, ge_key, canvasSize, x,y, zIndex}) {
        super({ctx, renderQueue, text: "", img: images.algaeImage, r: 90, x, sX: canvasSize.x * 0.065, sY: canvasSize.x * 0.065, textSize:Math.round(canvasSize.x*0.025) , y, radius: canvasSize.x * 0.032, canvasSize, zIndex: 5})
        this.isSelected = isSelected
        this.unselectedImg = images.algaeImage
        this.selectedImg = images.algaeSelectedImage
        this.ge_key = ge_key
    }

    draw() {
        this.img = this.isSelected ? this.selectedImg : this.unselectedImg
        super.draw()
    }

    sendData() {
        return {
            "isSelected": this.isSelected
        }
    }

    onClick({ x, y }) {
        if (super.inBoundingRadius({ x, y })) {
            this.isSelected = !this.isSelected
            return true
        }
        return false
    }

}
