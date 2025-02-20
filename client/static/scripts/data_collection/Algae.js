import DrawableObject from "./DrawableObject.js"

export default class Algae extends DrawableObject {
    constructor({ctx, renderQueue, images, canvasSize, x,y, zIndex}) {
        super({ctx, renderQueue, text: "", img: images.algaeImage, r: 90, x, sX: canvasSize.x * 0.065, sY: canvasSize.x * 0.065, textSize:Math.round(canvasSize.x*0.025) , y, radius: canvasSize.x * 0.032, canvasSize, zIndex: 5})
        this.isSelected = false
        this.unselectedImg = images.algaeImage
        this.selectedImg = images.algaeSelectedImage
    }

    draw() {
        this.img = this.isSelected ? this.selectedImg : this.unselectedImg
        super.draw()
    }

    onClick({ x, y }) {
        if (super.inBoundingRadius({ x, y })) {
            this.isSelected = !this.isSelected
            return true
        }
        return false
    }

}