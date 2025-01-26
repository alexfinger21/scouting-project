const { consoleLog } = require("./utility.js")

let sockets = {
    socketArray: [],
    addSocket: function(socket) {
        this.socketArray.push(socket)

        socket.on("disconnect", (reason) => {
        })

        return this.socketArray.length - 1
    },

    getSockets: function() {
        return this.socketArray.map(e => e.id)
    },

    removeSocket: function(socket) {
        const index = this.socketArray.find((e) => e == e)

        if (index === -1) {return false;}

        return this.socketArray.splice(index, 1)
    },

    clearSockets: function() {
        this.socketArray = null
    },

    emitAllSockets: function(type, msg) {
        for (const socket of this.socketArray) {
            socket.emit(type, msg)
        }
    }
}

module.exports = sockets
