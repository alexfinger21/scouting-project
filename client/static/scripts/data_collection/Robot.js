import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"

export default class Robot extends DrawableObject {
    /* 
    Ctx: canvas.getcontext2dallianceColor: "R" or "B", x: pixels from left
    y: pixels from top
    */
   
    constructor({ctx, clickable, img, containerImg, allianceColor, canvasSize, alliancePosition, customPos}) {
        let x = 0
        let y = 0
        let r = 0
        if(customPos) {
            x = customPos.x
            y = customPos.y
            r = customPos.r
        }
        else {
            if(allianceColor == "B") {
                x = canvasSize.x * 0.11
            }
            else {
                x = canvasSize.x * 0.78
            }
            switch(alliancePosition) {
                case "1":
                    y = canvasSize.y * 0.11
                    break
                case "2":
                    y = canvasSize.y * 0.48
                    break
                case "3":
                    y = canvasSize.y * 0.63
                    break
            }
        }

        super({ctx, img, x, y, sX: Math.floor(canvasSize.y * 0.13), sY: Math.floor(canvasSize.x*0.13)});
        this.clickable = clickable ? clickable : false 
        this.isSelected = clickable ? false : true
        if(this.clickable) {
            this.mask = new DrawableObject({ctx, img: containerImg, x, y, r, sX: Math.floor(canvasSize.y * 0.13), sY: Math.floor(canvasSize.x*0.13)})
        }
    }

    onClick({ x, y }) {
        consoleLog('hi11')
        if (this.clickable && super.inBoundingBox({ x, y })) {
            consoleLog('22')
            this.isSelected = !this.isSelected
        }
    }

    draw() {
        if(this.isSelected) {
            super.draw()
        }
        if(this.clickable) {
            this.mask.draw()
        }
    }
}
