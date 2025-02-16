import Reef from "./Reef.js"
import ClickArea from "./ClickArea.js"
import { consoleLog } from "../../utility.js"
import ProceedBtn from "./ProceedBtn.js"


export default class CoralScreen {
    constructor({ctx, allianceColor, images, canvasSize, letter, renderQueue, zIndex}) {
        this.ctx = ctx
        this.canvasSize = canvasSize

        const startX = canvasSize.x * 0.27
        const padX = canvasSize.x * 0.035
        const startY = canvasSize.y * 0.15
        const padY = canvasSize.y * 0.05

        consoleLog(images)

        this.proceedBtn = new ProceedBtn({x: canvasSize.x * 0.5, y: canvasSize.y * 0.5, sX: canvasSize.x * 0.5, sY: (canvasSize.x * 0.5)*76/368, zIndex: zIndex+4, imgs: images})

        this.reef = new Reef({ctx, renderQueue, allianceColor, letter, images, zIndex: zIndex+2, canvasSize: this.canvasSize, pos: {
                x: startX,
                y: startY
            } 
        })

        this.clickAreas = []

        for(let i = 0; i < 4; i++) {
            this.clickAreas.push(
                new ClickArea({ctx, zIndex: zIndex+3, renderQueue, value: 0, isSelected: false, img: images.clickAreaImage, canvasSize: this.canvasSize,
                    pos: {
                        x: startX + padX,
                        y: startY + padY + canvasSize.y * 0.142 * i,
                    },
                })
            )
        }
    }

    draw() {
        this.reef.draw()
        for(const clickArea of this.clickAreas) {
            clickArea.draw()
        }
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
    }
}
