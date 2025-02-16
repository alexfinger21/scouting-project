import Reef from "./Reef.js"
import ClickArea from "./ClickArea.js"
import { consoleLog } from "../../utility.js"
import ProceedBtn from "./ProceedBtn.js"


export default class CoralScreen {
    constructor({ctx, allianceColor, images, canvasSize, letter, renderQueue, zIndex}) {
        this.ctx = ctx
        this.canvasSize = canvasSize
        this.isSelected = true

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

        for(let i = 0; i < 4; i++) {
            this.clickAreas.push(
                new ClickArea({ctx, zIndex: zIndex+3, renderQueue, idx: i, scored: false, missing: 0, isSelected: false, img: images.clickAreaImage, canvasSize: this.canvasSize,
                    pos: {
                        x: startX + padX,
                        y: startY + padY + canvasSize.y * 0.142 * i,
                    },
                })
            )
        }
    }

    draw() {
        if (this.isSelected) {
            this.reef.draw()
            this.proceedBtn.draw()
            for(const clickArea of this.clickAreas) {
                clickArea.draw()
            }
        }
    }

    sendData() {
        const res = {}

        res["L4"] = this.clickAreas[0].sendData()
        res["L3"] = this.clickAreas[1].sendData()
        res["L2"] = this.clickAreas[2].sendData()
        res["L1"] = this.clickAreas[3].sendData()

        return res
    }

    onClick({x, y}) {
        for(const area of this.clickAreas) {
            const clicked = area.onClick({x, y})
            if(clicked) {
                for(const a of this.clickAreas) {
                    if(a != area) {
                        a.setIsSelected({value: false})
                    }
                }
            }
        }
        
        if (this.proceedBtn.onClick({x, y})) {
            this.isSelected = false 
        }
    }
}
