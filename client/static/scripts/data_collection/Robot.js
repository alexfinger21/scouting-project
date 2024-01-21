import DrawableObject from "./DrawableObject.js"

export default class Robot extends DrawableObject {
    /* 
    Ctx: canvas.getcontext2dallianceColor: "R" or "B", x: pixels from left
    y: pixels from top
    */
   
    constructor({x, y, ctx, img, startingPosition}) {
        super({ctx, img, x, y, sX: 200, sY: 200});
    }
}
