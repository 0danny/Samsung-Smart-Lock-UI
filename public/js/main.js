const ipcRenderer = window.require('electron').ipcRenderer

class Frontend {

    constructor() {
        logger.log("Frontend has been created.", "Frontend")

        this.currentModal = "none"

        this.registerEvents()
        this.modalController()


    }

    registerEvents() {
        $('.minimize-button').on('click', function() {
            ipcRenderer.send('minimize')
        })

        $('.close-button').on('click', function() {
            ipcRenderer.send('close')
        })
    }

    modalController() {
        var enableModal = function() {
            $('.dialog-flex').css('pointer-events', 'all')
            $('.dialog-flex').css('opacity', '1')
        }

        var disableModal = function() {
            $('.dialog-flex').css('pointer-events', 'none')
            $('.dialog-flex').css('opacity', '0')
        }

        $('#side-menu-button').on('click', function() {
            enableModal()
        })

        $('.dark-overlay').on('click', function() {
            disableModal()
        })

        //Navigation Containers
        $('.main-modal-navitem').on('click', function() {
            $('.main-modal-content').toggle(false)

            $(`.main-modal-content[contentname='${$(this).html()}']`).toggle(true)
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