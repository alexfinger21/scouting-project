class Robot extends DrawableObject {

    /* 
    Ctx: canvas.getcontext2dallianceColor: "red" or "blue", x: pixels from left
    y: pixels from top
    */
    constructor(x, y, ctx) {
        let img = new Image()
        if(allianceColor == blue) {
            img.src = "../../../images/data-collection/blue-robot.png"
        }
        else {
            img.src = "../../../images/data-collection/red-robot.png"
        }

        super(ctx, this.img, x, y, 255, 255);
    }
}