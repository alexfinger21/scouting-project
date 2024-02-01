import { consoleLog } from "../utility.js"
import DrawableObject from "./DrawableObject.js"
import GamePiece from "./GamePiece.js"
import Robot from "./Robot.js"

export default class RobotMap {
    constructor({ ctx, allianceColor, images, startPositions, stagePositions, canvasSize }) {
        this.startPositions = []
        this.stagePositions = []
        const isBlue = allianceColor == "B" 
        //Stage robots
        if(startPositions) {
            if("1" in startPositions) { //start position over subwoofer
                this.startPositions.push(new Robot({
                    ctx,
                    clickable: true,
                    isSelected: startPositions["1"],
                    img: images.robotImage,
                    containerImg: images.robotContainer,
                    canvasSize,
                    pos: {
                        x: isBlue ? canvasSize.x * 0.11 : canvasSize.x * 0.78,
                        y: canvasSize.y * 0.11,
                        r: 90,
                    },
                }))
            }
            if("2" in startPositions) { //start position ahead of subwoofer
                this.startPositions.push(new Robot({
                    ctx,
                    clickable: true,
                    isSelected: startPositions["2"],
                    img: images.robotImage,
                    containerImg: images.robotContainer,
                    canvasSize,
                    pos: {
                        x: isBlue ? canvasSize.x * 0.2 : canvasSize.x * 0.67,
                        y: canvasSize.y * 0.28,
                        r: 90,
                    },
                }))
            }
            if("3" in startPositions) { //start position under subwoofer
                this.startPositions.push(new Robot({
                    ctx,
                    clickable: true,
                    isSelected: startPositions["3"],
                    img: images.robotImage,
                    containerImg: images.robotContainer,
                    canvasSize,
                    pos: {
                        x: isBlue ? canvasSize.x * 0.11 : canvasSize.x * 0.78,
                        y: canvasSize.y * 0.48,
                        r: 90,
                    },
                }))
            }
            if("4" in startPositions) { //start position bottommost
                this.startPositions.push(new Robot({
                    ctx,
                    clickable: true,
                    isSelected: startPositions["4"],
                    img: images.robotImage,
                    containerImg: images.robotContainer,
                    canvasSize,
                    pos: {
                        x: isBlue ? canvasSize.x * 0.11 : canvasSize.x * 0.78,
                        y: canvasSize.y * 0.65,
                        r: 90,
                    },
                }))
            }
        }

        //Stage Positions going clockwise
        if(stagePositions) {
            if("1" in stagePositions) { 
                this.stagePositions.push(new Robot({
                    ctx,
                    clickable: true,
                    isSelected: stagePositions["1"],
                    img: images.robotImage,
                    containerImg: images.robotContainer,
                    canvasSize,
                    pos: {
                        x: isBlue ? canvasSize.x * 0.45 : canvasSize.x * 0.78,
                        y: canvasSize.y * 0.28,
                        r: 240,
                    },
                }))
            }
            if("2" in stagePositions) { 
                this.stagePositions.push(new Robot({
                    ctx,
                    clickable: true,
                    isSelected: stagePositions["2"],
                    img: images.robotImage,
                    containerImg: images.robotContainer,
                    canvasSize,
                    pos: {
                        x: isBlue ? canvasSize.x * 0.11 : canvasSize.x * 0.78,
                        y: canvasSize.y * 0.63,
                        r: 150,
                    },
                }))
            }
            if("3" in stagePositions) { 
                this.stagePositions.push(new Robot({
                    ctx,
                    clickable: true,
                    isSelected: stagePositions["3"],
                    img: images.robotImage,
                    containerImg: images.robotContainer,
                    canvasSize,
                    pos: {
                        x: isBlue ? canvasSize.x * 0.11 : canvasSize.x * 0.78,
                        y: canvasSize.y * 0.63,
                        r: 240,
                    },
                }))
            }
        }
        
    }

    onClick({ x, y }) {
        const sp = this.startPositions
        sp.forEach(function (robot) {
            const clicked = robot.onClick({ x, y })
            if(clicked) { //unselect other startPositions robots
                sp.forEach(function (otherRobot) {
                    if(otherRobot !== robot) {
                        otherRobot.setIsSelected({value: false})
                    }
                })
            }
        })

        this.stagePositions.forEach(function (robot) {
            const clicked = robot.onClick({ x, y })
            consoleLog("CLICKED IS: ", clicked)
            if(clicked) { //unselect other startPositions robots
                this.stagePositions.forEach(function (otherRobots) {
                    if(otherRobots !== robot) {
                        robot.setIsSelected({value: false})
                    }
                })
            }
        })
    }

    sendData() {
        const data = {}

        for (const x of this.pieces) {
            data[x.ge_key] = x.isSelected
        }

        return data
    }

    draw() {
        this.startPositions.forEach(function (robot) {
            robot.draw()
        })
        this.stagePositions.forEach(function (robot) {
            robot.draw()
        })
    }
}
