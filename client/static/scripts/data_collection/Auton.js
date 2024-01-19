import AutonMap from "./AutonMap.js"
import PiecesMap from "./PiecesMap.js"
import Robot from "./Robot.js"

export default class {
    /*ctx: canvas.getContext('2d')
    allianceColor: "R", "B" */
    constructor({ctx, allianceColor, images}) {
        this.ctx = ctx
        this.map = new AutonMap({ctx, allianceColor, img: images.autonMapImage})
        this.robot = new Robot({ctx, allianceColor, img: images.robot})
        this.pieces = new PiecesMap({ctx, allianceColor, img: images.gamePiece})

    }

    draw() {
        //this.ctx.save()

        this.map.draw()
        this.robot.draw()

        //this.ctx.restore()
    }
}
