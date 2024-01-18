import AutonMap from "./AutonMap.js"
import Robot from "./Robot.js"

export default class {
    /*ctx: canvas.getContext('2d')
    allianceColor: "R", "B" */
    constructor({ctx, allianceColor}) {
        this.ctx = ctx
        this.map = new AutonMap({ctx, allianceColor, x: 50, y: 100})
        this.robot = new Robot({ctx, allianceColor})
    }

    draw() {
        //this.ctx.save()

        this.map.draw()
        this.robot.draw()

        //this.ctx.restore()
    }
}
