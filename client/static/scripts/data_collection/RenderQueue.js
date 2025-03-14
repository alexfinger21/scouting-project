import { consoleLog } from "../utility.js"

function wait() {
    return new Promise((res, rej) => {
        setTimeout(res, 500)
    })
}

export default class RenderQueue {
    constructor({ctx, canvasSize, dpr}) {
        this.ctx = ctx
        this.queue = []

        this.canvasSize = canvasSize
        this.dpr = dpr
    }

    insert(obj) {
        this.queue.push(obj)
        let idx = this.queue.length - 1

        while (idx > 0 && this.queue[idx].zIndex < this.queue[Math.floor((idx-1)/2)].zIndex) {
            this.queue[idx] = this.queue[Math.floor((idx-1)/2)]
            this.queue[Math.floor((idx-1)/2)] = obj
            idx = Math.floor((idx-1)/2)
        }
    }

    pop() {
        const top = this.queue[0]
        
        this.queue[0] = this.queue[this.queue.length - 1]
        this.queue.pop()
        this.sort()

        return top
    }

    sort() {
        let idx = 0

        let left = idx * 2 + 1
        let right = idx * 2 + 2

        //consoleLog("QUEUE TOP", this.queue[idx], this.queue[left])
        while ((left < this.queue.length && this.queue[left].zIndex < this.queue[idx].zIndex) || (right < this.queue.length && this.queue[right].zIndex < this.queue[idx].zIndex)) {
            if (left < this.queue.length && (right >= this.queue.length || this.queue[left].zIndex < this.queue[right].zIndex)) {
                const tmp = this.queue[idx]
                this.queue[idx] = this.queue[left]
                this.queue[left] = tmp
                idx = left
                left = idx * 2 + 1
                right = idx * 2 + 2
            } else if (right < this.queue.length) {
                const tmp = this.queue[idx]
                this.queue[idx] = this.queue[right]
                this.queue[right] = tmp
                idx = right
                left = idx * 2 + 1
                right = idx * 2 + 2
            }     
        }

    }

    render() {
        this.ctx.save()
        this.ctx.setTransform(1/this.dpr, 0, 0, 1/this.dpr, 0, 0) //reset canvas transform just in case and set dpr (device pixel ratio) to remove blur
        this.ctx.clearRect(0, 0, this.canvasSize.x*this.dpr, this.canvasSize.y*this.dpr)
        
        //consoleLog(this.queue.slice())
        while (this.queue.length) {
            const rndr = this.pop()
            rndr.render() 
            //const w = await wait()
        }
        //consoleLog("queue end")
        this.ctx.restore()
    }
}
