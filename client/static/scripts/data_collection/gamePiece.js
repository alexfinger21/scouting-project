import DrawableObject from "./DrawableObject.js"

export default class extends DrawableObject {
    constructor({x, y, ctx}) {
        const img = new Image()
        img.src = "../../../images/data-collection/orange-note.png"

        super({ctx, img, x, y, sX: 200, sY: 200});
    }
}
