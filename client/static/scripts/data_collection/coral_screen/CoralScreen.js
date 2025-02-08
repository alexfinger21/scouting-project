import Reef from "./Reef"

export default class CoralScreen {
    constructor({ctx, allianceColor, images, cX, cY}) {
        this.ctx = ctx
        this.canvasSize = {x: cX, y: cY}
        this.x = x
        this.y = y
        this.sX = sX
        this.sY = sY

        this.reef = new Reef({ctx, allianceColor, image: images.reef, canvasSize: this.canvasSize })
        this.clickAreas = [
            ClickArea({ctx, value: 1, clickable: true, isSelected: false, image: images.clickArea, canvasSize: this.canvasSize,
                pos: {
                    x: canvasSize.x * 0.2,
                    y: canvasSize.y * 0.3,
                },
            }),
            ClickArea({ctx, value: 2, clickable: true, isSelected: false, image: images.clickArea, canvasSize: this.canvasSize,
                pos: {
                    x: canvasSize.x * 0.2,
                    y: canvasSize.y * 0.45,
                },
            }),
            ClickArea({ctx, value: 3, clickable: true, isSelected: false, image: images.clickArea, canvasSize: this.canvasSize,
                pos: {
                    x: canvasSize.x * 0.2,
                    y: canvasSize.y * 0.6,
                },
            }),
            ClickArea({ctx, value: 4, clickable: true, isSelected: false, image: images.clickArea, canvasSize: this.canvasSize,
                pos: {
                    x: canvasSize.x * 0.2,
                    y: canvasSize.y * 0.75,
                },
            }),
        ]
    }

    draw() {
        this.reef.draw()
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
