import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"
import GamePiece from "./GamePiece.js"
import Robot from "./Robot.js"

export default class RobotMap {
    constructor({ ctx, allianceColor, images, robotStartingPercent, renderQueue, canvasSize }) {
        this.renderQueue = renderQueue
        this.startPositions = []
        this.bargePositions = []
        const isBlue = allianceColor == "B"
        //Stage robots
        this.startPositions.push(new Robot({
            ctx,
            draggable: true,
            clickable: true,
            value: Math.max(Math.min(robotStartingPercent ?? 0, 100), 0),
            img: images.robotImage,
            containerImg: images.robotStartPosImage,
            renderQueue,
            allianceColor,
            canvasSize,
            pos: {
                x: isBlue ? canvasSize.x * 0.16 : canvasSize.x * 0.67,
                y: isBlue ? canvasSize.y * 0.145 : canvasSize.y * 0.08,
                r: isBlue ? 0 : 180 //150,
            },
        }))


    }

    onClick({ x, y }) {
        this.startPositions.forEach(e => e.onClick({ x, y }))
    }

    onMouseDown({ x, y }) {
        for (const r of [...this.startPositions, ...this.bargePositions]) {
            if (r.draggable) {
                r.onMouseDown({ x, y })
            }
        }
    }

    onMouseMove({ x, y }) {
        for (const r of [...this.startPositions, ...this.bargePositions]) {
            if (r.draggable) {
                r.onMouseMove({ x, y })
            }
        }
    }

    onMouseUp({ x, y }) {
        for (const r of [...this.startPositions, ...this.bargePositions]) {
            if (r.draggable) {
                r.onMouseUp({ x, y })
            }
        }
    }



    sendData() {
        let data = {}
        this.startPositions.forEach((robot) => {
            data["Starting Location"] = robot.getRobotPosition()
        })

        this.bargePositions.forEach((robot) => {
            if(robot.isSelected) {
                data["Inbarge Location"] = robot.value
            }
        })

        return data
    }

    draw() {
        this.startPositions.forEach(function (robot) {
            robot.draw()
        })
        this.bargePositions.forEach(function (robot) {
            robot.draw()
        })
    }
}
