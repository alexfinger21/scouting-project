import DrawableObject from "./DrawableObject.js"

export default class Robot extends DrawableObject {
    /* 
    Ctx: canvas.getcontext2dallianceColor: "R" or "B", x: pixels from left
    y: pixels from top
    */
   
    constructor({x, y, allianceColor, ctx}) {
        const img = new Image()
        if(allianceColor == "B") {
            img.src = "../../../images/data-collection/blue-robot.png"
        }
        else {
            img.src = "../../../images/data-collection/red-robot.png"
        }

        super({ctx, img, x, y, sX: 200, sY: 200});
    }
}