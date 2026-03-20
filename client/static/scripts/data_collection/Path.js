import DrawableObject from "./DrawableObject.js"

const getDistance = (p1, p2) =>
    Math.hypot((p2?.x ?? 0) - (p1?.x ?? 0), (p2?.y ?? 0) - (p1?.y ?? 0))

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export default class Path extends DrawableObject {
    constructor({ ctx, path, renderQueue, canvasSize }) {
        super({ ctx, zIndex: 10000, renderQueue })
        this.path = path
        this.canvasSize = canvasSize
        this.scale = this.canvasSize.x * window.devicePixelRatio / 100
        this.zIndex = 10
    }

    getControlPoints(p0, p1, p2, p3) {
        const d01 = Math.max(getDistance(p0, p1), 1)
        const d12 = Math.max(getDistance(p1, p2), 1)
        const d23 = Math.max(getDistance(p2, p3), 1)
        const adaptiveSmoothing = clamp(d12 / 180, 0.08, 0.22)

        const cp1Scale = adaptiveSmoothing * d12 / (d01 + d12)
        const cp2Scale = adaptiveSmoothing * d12 / (d12 + d23)

        return {
            cp1: {
                x: p1.x + cp1Scale * (p2.x - p0.x),
                y: p1.y + cp1Scale * (p2.y - p0.y),
            },
            cp2: {
                x: p2.x - cp2Scale * (p3.x - p1.x),
                y: p2.y - cp2Scale * (p3.y - p1.y),
            },
        }
    }

    draw() {
        if (!Array.isArray(this.path) || this.path.length < 2) {
            return
        }

        this.renderQueue.insert(this)
    }

    getLineWidth() {
        return clamp(this.canvasSize.x * 0.0115 * this.dpr, 6 * this.dpr, 12 * this.dpr)
    }

    getWaypointRadius() {
        return clamp(this.getLineWidth() * 0.22, 1.6 * this.dpr, 3.1 * this.dpr)
    }

    getEndpointRadius() {
        return clamp(this.getLineWidth() * 1.45, 11 * this.dpr, 19 * this.dpr)
    }

    renderEndpoint(point, color) {
        this.ctx.beginPath()
        this.ctx.fillStyle = "#ffffff"
        this.ctx.arc(
            point.x * this.dpr,
            point.y * this.dpr,
            this.getEndpointRadius() * 1.34,
            0,
            2 * Math.PI,
        )
        this.ctx.fill()

        this.ctx.beginPath()
        this.ctx.fillStyle = color
        this.ctx.arc(
            point.x * this.dpr,
            point.y * this.dpr,
            this.getEndpointRadius(),
            0,
            2 * Math.PI,
        )
        this.ctx.fill()
    }

    renderWaypoints() {
        if (this.path.length < 3) {
            return
        }

        const radius = this.getWaypointRadius()

        for (let i = 1; i < this.path.length - 1; ++i) {
            const point = this.path[i]
            this.ctx.beginPath()
            this.ctx.fillStyle = "rgba(255, 244, 214, 0.95)"
            this.ctx.arc(
                point.x * this.dpr,
                point.y * this.dpr,
                radius,
                0,
                2 * Math.PI,
            )
            this.ctx.fill()

            this.ctx.beginPath()
            this.ctx.fillStyle = "rgba(255, 214, 102, 0.85)"
            this.ctx.arc(
                point.x * this.dpr,
                point.y * this.dpr,
                Math.max(radius * 0.58, 1 * this.dpr),
                0,
                2 * Math.PI,
            )
            this.ctx.fill()
        }
    }

    render() {
        if (!Array.isArray(this.path) || this.path.length < 2) {
            return
        }

        const lineWidth = this.getLineWidth()

        this.ctx.save()
        this.ctx.globalAlpha = this.opacity
        this.ctx.lineWidth = lineWidth * 2.2
        this.ctx.strokeStyle = "rgba(38, 70, 108, 0.18)"
        this.ctx.lineCap = "round"
        this.ctx.lineJoin = "round"
        this.ctx.shadowColor = "rgba(79, 195, 247, 0.38)"
        this.ctx.shadowBlur = lineWidth * 2.5
        this.ctx.beginPath()
        this.ctx.moveTo(this.path[0].x * this.dpr, this.path[0].y * this.dpr)

        for (let i = 0; i < this.path.length - 1; ++i) {
            const p0 = this.path[Math.max(0, i - 1)]
            const p1 = this.path[i]
            const p2 = this.path[i + 1]
            const p3 = this.path[Math.min(this.path.length - 1, i + 2)]
            const { cp1, cp2 } = this.getControlPoints(p0, p1, p2, p3)

            this.ctx.bezierCurveTo(
                cp1.x * this.dpr,
                cp1.y * this.dpr,
                cp2.x * this.dpr,
                cp2.y * this.dpr,
                p2.x * this.dpr,
                p2.y * this.dpr,
            )
        }

        this.ctx.stroke()
        this.ctx.shadowBlur = 0
        this.ctx.lineWidth = lineWidth * 1.45
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.24)"
        this.ctx.stroke()
        this.ctx.lineWidth = lineWidth
        this.ctx.strokeStyle = "#ffa400"
        this.ctx.shadowColor = "rgba(255, 164, 0, 0.34)"
        this.ctx.shadowBlur = lineWidth * 0.9
        this.ctx.stroke()
        this.ctx.shadowBlur = 0

        this.renderWaypoints()
        this.renderEndpoint(this.path[0], "#ffd166")
        this.renderEndpoint(this.path[this.path.length - 1], "#22c55e")
        this.ctx.restore()
    }
}
