const ipcRenderer = window.require('electron').ipcRenderer

class Frontend {

    constructor() {
        logger.log("Frontend has been created.", "Frontend")

        this.registerEvents()
    }

    registerEvents() {
        $('.minimize-button').on('click', function() {
            ipcRenderer.send('minimize')
        })
        $('.close-button').on('click', function() {
            ipcRenderer.send('close')
        })
    }

}

class Logger {

    constructor() {
        this.currentDate = new Date()
    }

    log(object, prefix) {
        console.log(`[${this.currentDate.getHours() + ":" + this.currentDate.getMinutes() + ":" + this.currentDate.getSeconds()}][${prefix}]: ${object}`)
    }

}

$(function() {
    window.logger = new Logger()
    window.frontend = new Frontend()
})