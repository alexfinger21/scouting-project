import Reef from "./Reef.js"
import ClickArea from "./ClickArea.js"
import { consoleLog } from "../../utility.js"
import ProceedBtn from "./ProceedBtn.js"
import DrawableObject from "../DrawableObject.js"


export default class CoralScreen {
    constructor({ctx, ge_key, data = {}, allianceColor, images, canvasSize, letter, renderQueue, zIndex}) {
        this.ctx = ctx
        this.canvasSize = canvasSize
        this.letter = letter
        this.isSelected = false
        this.ge_key = ge_key

        const startX = canvasSize.x * 0.27
        const padX = canvasSize.x * 0.035
        const startY = canvasSize.y * 0.15
        const padY = canvasSize.y * 0.05

        this.proceedBtn = new ProceedBtn({ctx, x: canvasSize.x * 0.495, y: canvasSize.y * 0.85, sX: canvasSize.x * 0.4, sY: (canvasSize.x * 0.4)*76/368, zIndex: zIndex+4, imgs: images, renderQueue})

        this.reef = new Reef({ctx, renderQueue, allianceColor, letter, images, zIndex: zIndex+2, canvasSize: this.canvasSize, pos: {
                x: startX,
                y: startY
            } 
        })

        this.clickAreas = []
        this.scoreIndicators = []

        for(let i = 3; i >= 0; i--) {
            const cA = new ClickArea({ctx, zIndex: zIndex+3, renderQueue, scored: data?.["L" + (i+1)]?.scored, missed: data?.["L" + (i+1)]?.missed, value: 0, img: images.clickAreaImage, canvasSize: this.canvasSize,
                pos: {
                    x: startX + padX,
                    y: startY + padY + canvasSize.y * 0.142 * i,
                },
            })
            this.clickAreas.push(cA)
            const sI = new DrawableObject({ctx, sX: 1, sY: 1, img: "text", text: `${cA.scored}/${cA.scored+cA.missed}`, textSize: canvasSize.x * 0.04, renderQueue, zIndex: 9999999,
                x: startX + padX + cA.sX + canvasSize.x * 0.05,
                y: startY + padY + canvasSize.y * 0.142 * i + canvasSize.x * 0.06,
            })
            sI.color = allianceColor == "B" ? "rgb(59, 134, 205)" : "rgb(255, 43, 43)"
            this.scoreIndicators.push(sI)
        }
    }

    draw() {
        if(this.isSelected) {
            this.reef.draw()
            this.proceedBtn.draw()
            for(const clickArea of this.clickAreas) {
                clickArea.draw()
            }
            for(let i = 0; i < 4; i++) {
                const sI = this.scoreIndicators[i]
                const clickArea = this.clickAreas[i]
                sI.text = `${clickArea.scored}/${clickArea.scored+clickArea.missed}`
                sI.draw()
            }
        }
    }

    sendData() {
        const res = {}

        res["L4"] = this.clickAreas[3].sendData()
        res["L3"] = this.clickAreas[2].sendData()
        res["L2"] = this.clickAreas[1].sendData()
        res["L1"] = this.clickAreas[0].sendData()

        return res
    }

    onClick({x, y}) {
        if (this.isSelected) {
            for(const area of this.clickAreas) {
                const clicked = area.onClick({x, y})
                if(clicked) {
                    for(const a of this.clickAreas) {
                        if(a != area) {
                            a.setValue({value: 0})
                        }
                    }
                }
            }
            
            if (this.proceedBtn.onClick({x, y})) {
                for(let i = 0; i < 4; i++) {
                    const a = this.clickAreas[i]
                    if(a.value == 1) {
                        this.clickAreas[i].scored++
                    }
                    if(a.value == 2) {
                        this.clickAreas[i].missed++
                    }
                    a.setValue({value: 0})
                }
                this.isSelected = false
                return true
            }
        }
        return false
    }
}
