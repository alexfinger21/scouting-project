import { consoleLog } from "../utility.js"

export default class RenderQueue {
    constructor(objs = []) {
        this.queue = []

        for (const x of objs) {
            this.insert(x)
        }
    }

    insert(obj) {
        this.queue.push_back(obj)
        let idx = this.queue.length - 1

        while (idx > 0 && this.queue[idx].zIndex > this.queue[Math.floor((idx-1)/2)].zIndex) {
            this.queue[idx] = this.queue[Math.floor((idx-1)/2)]
            this.queue[Math.floor((idx-1)/2)] = obj
            idx = Math.floor((idx-1)/2)
        }
    }

    pop() {
        const top = this.queue[0]
        
        this.queue[0] = null

        return top
    }

    sort() {
        let idx = 0

        let left = idx * 2 + 1
        let right = idx * 2 + 2

        while (this.queue[idx] == null || (left < this.queue.length && this.queue[left] > this.queue[idx]) || (right < this.queue.length && this.queue[right] > this.queue[idx])) {
            if (this.queue[left] > this.queue[right]) {
                const tmp = this.queue[idx]
                this.queue[idx] = this.queue[left]
                this.queue[left] = tmp
                idx = left
                left = idx * 2 + 1
                right = idx * 2 + 2
            } else {
                const tmp = this.queue[idx]
                this.queue[idx] = this.queue[right]
                this.queue[right] = tmp
                idx = right
                left = idx * 2 + 1
                right = idx * 2 + 2
            }     
        }

        this.queue.pop()
    }

    render() {
        consoleLog("QUEUE", this.queue)
        while (this.queue.length) {
            const rndr = this.pop()
            consoleLog(rndr)
            rndr.render() 
        }
    }
}
