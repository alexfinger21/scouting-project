import { consoleLog } from "../utility.js"
import QuadraticLine from "./QuadraticLine.js"

export default class Path {
    constructor({ ctx, path, renderQueue, canvasSize }) {
        this.ctx = ctx
        this.path = path
        this.canvasSize = canvasSize
        this.renderQueue = renderQueue
    }

    draw() {
        const lines = []
        
        for (let i = 1; i<this.path.length; ++i) {
            let p1;

            if (Math.abs(this.path[i-1].y - this.canvasSize.y/2) > Math.abs(this.path[i].y - this.canvasSize.y/2)) {
                p1 = {x: this.path[i].x, y: this.path[i-1].y}
            } else {
                p1 = {x: this.path[i-1].x, y: this.path[i].y}
            }

            lines.push(new QuadraticLine({
                ctx: this.ctx, 
                canvasSize: this.canvasSize,
                p0: this.path[i-1],
                p1,
                p2: this.path[i]
            }))
        }

        lines.forEach(l => this.renderQueue.insert(l))
    }

    render() {}
}

