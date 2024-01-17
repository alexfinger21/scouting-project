export default class extends DrawableObject {
    constructor(x, y) {
        let img = new Image()
        if(allianceColor == blue) {
            img.src = "../../../images/data-collection/orange-note.png"
        }
        else {
            img.src = "../../../images/data-collection/orange-note.png"
        }

        super(ctx, this.img, x, y, 200, 200);
    }
}
