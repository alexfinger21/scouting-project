import Reef from "./Reef.js"
import ClickArea from "./ClickArea.js"
import { consoleLog } from "../../utility.js"


export default class CoralScreen {
    constructor({ctx, allianceColor, images, canvasSize, renderQueue}) {
        this.ctx = ctx
        this.canvasSize = canvasSize

        consoleLog(images)

        this.reef = new Reef({ctx, renderQueue, allianceColor, img: images.reefImage, canvasSize: this.canvasSize })
        this.clickAreas = [
            new ClickArea({ctx, renderQueue, value: 1, clickable: true, isSelected: false, img: images.clickAreaImage, canvasSize: this.canvasSize,
                pos: {
                    x: canvasSize.x * 0.2,
                    y: canvasSize.y * 0.3,
                },
            }),
            new ClickArea({ctx, renderQueue, value: 2, clickable: true, isSelected: false, img: images.clickAreaImage, canvasSize: this.canvasSize,
                pos: {
                    x: canvasSize.x * 0.2,
                    y: canvasSize.y * 0.45,
                },
            }),
            new ClickArea({ctx, renderQueue, value: 3, clickable: true, isSelected: false, img: images.clickAreaImage, canvasSize: this.canvasSize,
                pos: {
                    x: canvasSize.x * 0.2,
                    y: canvasSize.y * 0.6,
                },
            }),
            new ClickArea({ctx, renderQueue, value: 4, clickable: true, isSelected: false, img: images.clickAreaImage, canvasSize: this.canvasSize,
                pos: {
                    x: canvasSize.x * 0.2,
                    y: canvasSize.y * 0.75,
                },
            }),
        ]
    }

    draw() {
        this.reef.draw()
        for(const clickArea of this.clickAreas) {
            clickArea.draw()
        }
    }

    onClick({x, y}) {
        for(area of this.clickAreas) {
            const clicked = area.onClick({x, y})
            if(clicked) {
                for(area of this.clickAreas) {
                    area.setIsSelected({value: false})
                }
            }
        }
    }
}
