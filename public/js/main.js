const ipcRenderer = window.require('electron').ipcRenderer
const crypto = window.require('crypto')
const async = require('async')


class Frontend {

    constructor() {
        logger.log("Frontend has been created.", "Frontend")

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

        $('#login-account-button').on('click', function() {
            smartlock.login()
        })
    }

    modalController() {
        var enableModal = function(modalName) {
            logger.log(`Enabling a new modal: ${modalName}`, 'Frontend')

            $('.dialog-flex').css('pointer-events', 'all')
            $('.dialog-flex').css('opacity', '1')

            //Fail safe, incase somehow another modal is open while we are trying to open a new one.
            $('.modal').css('pointer-events', 'none')
            $('.modal').css('opacity', '0')

            $(`.modal[modalname='${modalName}']`).css('pointer-events', 'all')
            $(`.modal[modalname='${modalName}']`).css('opacity', '1')
        }

        var disableModals = function() {
            $('.dialog-flex').css('pointer-events', 'none')
            $('.dialog-flex').css('opacity', '0')

            $('.modal').css('pointer-events', 'none')
            $('.modal').css('opacity', '0')
        }

        $('#side-menu-button').on('click', function() {
            enableModal('smartlock')
        })

        $('#account-menu-button').on('click', function() {
            enableModal('account')


        })

        $('.dark-overlay').on('click', function() {
            disableModals()
        })

        //Navigation Containers
        $('.main-modal-navitem').on('click', function() {
            $('.main-modal-content').toggle(false)

            $(`.main-modal-content[contentname='${$(this).html()}']`).toggle(true)
        })

        $('.door-controller-wrapper').on('click', async function() {
            logger.log('Changing door state', 'Frontend')
        })
    }
}

class SmartLock {

    constructor() {
        logger.log("Smart lock has been created.", "SmartLock")

        this.mainIOT = 'https://iot.samsung-ihp.com:8088'
        this.loginPath = 'openhome/v10/user/login'

        this.loginResponse = {
            authCode: "", //Base 64 Encoded (Is valid for roughly 30-40 minutes, not sure real time)
            authToken: "", //Second Auth (Need this)
            memberId: "", //Users UUID
            message: "",
            result: true
        }
    }


    async login() {

        var loginObject = {
            apiVer: "v20", //API Version (May change)
            appVer: "2.0.21", //App Version
            authCode: "",
            authNumber: "",
            countryCd: "AU", //Country Code (Not sure if this will need to be changed to the users actual country code)
            createDate: utilities.timestamp(), //Request creation date concatenated e.g. ((Date) 2022 04 19 | (Time 24 Hours) 16 37 30) Result: 20220419163730
            hashData: utilities.randomAlphanumeric(128), //128 char random alphanumeric
            imei: utilities.randomIMEI(), //Can be random
            locale: "en", //Locale 
            locationAgreeYn: "N", //T&C Agreement (Possibly?)
            loginId: "", //Username
            mobileNum: "",
            osTypeCd: "IOS", //Phone Type
            osVer: "15.0", //Phone Version
            overwrite: true, //Unsure
            pushToken: utilities.randomAlphanumeric(64), //64 char random alphanumeric
            pwd: "", //Password hashed in SHA512
            timeZone: 10 //Timezone
        }

        loginObject.loginId = $('#login-account-id').val()
        loginObject.pwd = utilities.hashPassword($('#login-account-password').val())

        logger.logObject("Login Object", loginObject, "SmartLock")

        const headers = {
            'Accept': '*/*',
            'Authorization': 'CUL'
                /* Axios won't let me set a user agent, but the API doesn't care so I guess it's ok
                'User-Agent': 'SmartDoorLock_Global/2.0.21 (com.samsung.sds.global.doorlock.dlis; build:129; iOS 14.2.0) Alamofire/5.0.5' */
        }

        try {
            let response = await axios.put(`${this.mainIOT}/${this.loginPath}`, loginObject, { headers })

            this.loginResponse = response.data

            logger.logObject('Axios Object', response, 'SmartLock')
            logger.logObject('Axios Response', this.loginResponse, 'SmartLock')

            logger.log('Successfully logged into account.', 'SmartLock')


        } catch (exception) {
            logger.log(`There was an error logging in: ${exception} | Password may be incorrect, or you have hit a rate limit.`, "SmartLock")

            logger.showNotification("Your password or username was incorrect.")
        }
    }
}

class Utilities {

    constructor() {
        logger.log("Utilities has been created.", "Utilities")
    }

    hashPassword(password) {
        return crypto.createHash('sha512').update(password).digest('hex')
    }

    timestamp() {
        //Real janky way of formatting date, but I'm very lazy
        return `${logger.currentDate.getFullYear()}${(logger.currentDate.getMonth() + 1).toString().padStart(2, '0')}${logger.currentDate.getDate().toString().padStart(2, '0')}${logger.currentDate.getHours()}${logger.currentDate.getMinutes()}${logger.currentDate.getSeconds()}`
    }

    randomAlphanumeric(length, uppercase) {
        var choices = uppercase ? "0123456789ABCDEF" : "0123456789abcdef" //Hex Random

        var finalString = ""

        for (var i = 0; i < length; i++) {
            finalString += choices[this.getRandomArbitrary(0, choices.length)]
        }

        return finalString
    }

    randomIMEI() {
        return `${this.randomAlphanumeric(8, true)}-${this.randomAlphanumeric(4, true)}-${this.randomAlphanumeric(4, true)}-${this.randomAlphanumeric(4, true)}-${this.randomAlphanumeric(12, true)}`
    }


    getRandomArbitrary(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class Logger {

    constructor() {
        this.currentDate = new Date()

        this.notificationQueue = async.queue((task, callback) => {

            logger.log(`Processing task: ${task}`, 'Notification Queue')

            $('.notification-bar').html(task)
            $('.notification-bar').css('bottom', '0px')

            setTimeout(function() {
                $('.notification-bar').css('bottom', '-70px')

                callback()
            }, 2000);
        }, 1)
    }

    currentDateText() {
        return this.currentDate.getHours() + ":" + this.currentDate.getMinutes() + ":" + this.currentDate.getSeconds()
    }

    log(object, prefix) {
        console.log(`[${this.currentDateText()}][${prefix}]: ${object}`)
    }

    logObject(text, object, prefix) {
        console.log(`[${this.currentDateText()}][${prefix}]: ${text}`, object)
    }

    async showNotification(notificationText) {
        this.notificationQueue.push(notificationText, (err) => {
            if (err) {
                console.log(`An error occurred while processing task ${notificationText} | ${err}`)
            } else {
                console.log(`Finished processing task ${notificationText}.`)
            }
        })
    }
}

$(function() {
    window.logger = new Logger()
    window.frontend = new Frontend()
    window.smartlock = new SmartLock()
    window.utilities = new Utilities()
})