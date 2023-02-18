let sockets = {
    socketArray: [],
    addSocket: function(socket) {
        this.socketArray.push(socket)
        return this.socketArray.length - 1
    },

    getSockets: function() {
        return this.socketArray.map(e => e.id)
    },

    removeSocket: function(index) {
        this.socketArray.splice(index, 1)
    },

    clearSockets: function() {
        this.socketArray = null
    },

    emitAllSockets: function(msg, type) {
        for (let i = 0; i<this.socketArray.length; i++) {
            this.socketArray[i].emit(type, msg)
        }
    }
}

module.exports = sockets