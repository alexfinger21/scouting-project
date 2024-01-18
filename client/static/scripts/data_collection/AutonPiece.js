import DrawableObject from "./DrawableObject";

export default class extends DrawableObject {
    constructor({x, y, ctx}) {
        let img = new Image()
        img.src = "../../../images/data-collection/orange-note.png"

        super({ctx, img, x, y, sX: 200, sY: 200});
    }
}
