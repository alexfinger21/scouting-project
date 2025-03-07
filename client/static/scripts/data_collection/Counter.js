import DrawableObject from "./DrawableObject.js"

export default class Counter extends DrawableObject {
    constructor({ctx, renderQueue, count, show=true, canvasSize, x,y}) {
        super({ctx, renderQueue, text: String(count), img: "text", r: 90, x, y, sX: canvasSize.x * 0.12, sY: canvasSize.x * 0.12, textSize:Math.round(canvasSize.x*0.3), canvasSize, zIndex: 101})
        this.show = show
        this.count = count
        this.textSize = Math.round(canvasSize.x * 0.05)
        this.color = "#FFFFFF"
    }

    draw() {
        this.text = this.count
        if(this.show) {
            super.draw()
        }
    }

}
