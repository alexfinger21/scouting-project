import DrawableObject from "./DrawableObject";

export default class AutonMap extends DrawableObject {
    constructor({ctx, allianceColor}) {
        let img = new Image()
        if(allianceColor == blue) {
            img.src = "../../../images/data-collection/blue-robot.png"
        }
        else {
            img.src = "../../../images/data-collection/red-robot.png"
        }

        
        super({ctx, img, x, y, sX: 200, sY: 200});
    }
}
