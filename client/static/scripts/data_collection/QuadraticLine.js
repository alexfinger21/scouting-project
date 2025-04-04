import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"

export default class QuadraticLine extends DrawableObject {
    constructor({ p0, p1, p2, ctx, canvasSize }) {
        super({ ctx, zIndex: 10000 })
        this.p0 = p0
        this.p1 = p1
        this.p2 = p2
        this.ctx = ctx
        this.canvasSize = canvasSize
        this.scale = this.canvasSize.x * window.devicePixelRatio / 100
        this.zIndex = 10
    }

    render() {
        this.ctx.save()
        this.ctx.fillStyle = "orange"
        this.ctx.beginPath()
        this.ctx.arc(this.p0.x * this.dpr, this.p0.y * this.dpr, this.canvasSize.y * this.scale / 250, 0, 2 * Math.PI) // Start point
        this.ctx.arc(this.p2.x * this.dpr, this.p2.y * this.dpr, this.canvasSize.y * this.scale / 250, 0, 2 * Math.PI) // End point
        this.ctx.fill()
        this.ctx.lineWidth = this.scale
        this.ctx.globalAlpha = this.opacity
        this.ctx.strokeStyle = "white"
        this.ctx.beginPath()
        this.ctx.moveTo(this.p0.x * this.dpr, this.p0.y * this.dpr)
        this.ctx.quadraticCurveTo(this.p1.x * this.dpr, this.p1.y * this.dpr, this.p2.x * this.dpr, this.p2.y * this.dpr)
        this.ctx.stroke()
        this.ctx.restore()
    }
}
