import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"
import GamePiece from "./GamePiece.js"
import Robot from "./Robot.js"

export default class RobotMap {
    constructor({ ctx, allianceColor, images, robotStartingPercent, stagePositions, canvasSize }) {
        this.startPositions = []
        this.bargePositions = []
        const isBlue = allianceColor == "B"
        //Stage robots
        if (robotStartingPercent) {
            this.startPositions.push(new Robot({
                ctx,
                draggable: true,
                clickable: true,
                value: robotStartingPercent,
                img: images.robotImage,
                containerImg: images.robotContainer,
                canvasSize,
                pos: {
                    x: isBlue ? canvasSize.x * 0.43 : canvasSize.x * 0.45,
                    y: isBlue ? canvasSize.y * 0.63 : canvasSize.y * 0.64,
                    r: isBlue ? 0 : 180 //150,
                },
            }))

        }

    }

    onClick({ x, y }) {
        const startPositions = this.startPositions
        startPositions.forEach(function (robot) {
            const clicked = robot.onClick({ x, y })
            if (clicked) { //unselect other startPositions robots
                startPositions.forEach(function (otherRobot) {
                    if (otherRobot !== robot) {
                        otherRobot.setIsSelected({ value: false })
                    }
                })
            }
        })

        const bargePositions = this.bargePositions

        bargePositions.forEach(function (robot) {
            const clicked = robot.onClick({ x, y })
            if (clicked) { //unselect other startPositions robots
                bargePositions.forEach(function (otherRobot) {
                    if (otherRobot !== robot) {
                        otherRobot.setIsSelected({ value: false })
                    }
                })
            }
        })
    }

    onMouseDown({ x, y }) {
        for (const r of [...this.startPositions, ...this.bargePositions]) {
            if (r.draggable) {
                r.onMouseDown({ x, y })
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


    onMouseMove({ x, y }) {
        for (const r of [...this.startPositions, ...this.bargePositions]) {
            if (r.draggable) {
                r.onMouseMove({ x, y })
            }
        }
    }

    sendData() {
        let data = {}
        this.startPositions.forEach((robot) => {
            if(robot.isSelected) {
                data["Starting Location"] = robot.value
            }
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
