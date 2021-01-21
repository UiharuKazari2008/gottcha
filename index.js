const systemglobal = require('./config.json');
const eris = require('eris');
const graylog2 = require("graylog2");
const os = require('os');
const colors = require('colors');

const logger1 = new graylog2.graylog({
    servers: [systemglobal.LogServer[0]],
    hostname: os.hostname(), // the name of this host
                             // (optional, default: os.hostname())
    facility: 'API-Server',     // the facility for these log messages
    // (optional, default: "Node.js")
    bufferSize: 1350         // max UDP packet size, should never exceed the
                             // MTU of your system (optional, default: 1400)
});
const logger2 = new graylog2.graylog({
    servers: [systemglobal.LogServer[1]],
    hostname: os.hostname(), // the name of this host
                             // (optional, default: os.hostname())
    facility: 'Gotcha-IO',     // the facility for these log messages
    // (optional, default: "Node.js")
    bufferSize: 1350         // max UDP packet size, should never exceed the
                             // MTU of your system (optional, default: 1400)
});

logger1.on('error', function (error) {
    console.error('Error while trying to write to graylog host NJA:'.red, error);
});
logger2.on('error', function (error) {
    console.error('Error while trying to write to graylog host END:'.red, error);
});

async function printLine(proccess, text, level, object, object2) {
    let logObject = {}
    let logClient = "Unknown"
    if (proccess) {
        logClient = proccess
    }
    logObject.process = logClient
    let logString =  `${logClient} : ${text}`
    if (typeof object !== 'undefined' || object) {
        if ( (typeof (object) === 'string' || typeof (object) === 'number' || object instanceof String) ) {
            logString += ` : ${object}`
        } else if (typeof(object) === 'object') {
            logObject = Object.assign({}, logObject, object)
            if (object.hasOwnProperty('message')) {
                logString += ` : ${object.message}`
            } else if (object.hasOwnProperty('sqlMessage')) {
                logString += ` : ${object.sqlMessage}`
            } else if (object.hasOwnProperty('itemFileData')) {
                delete logObject.itemFileData
                logObject.itemFileData = object.itemFileData.length
            }
        }
    }
    if (typeof object2 !== 'undefined' || object2) {
        if (typeof(object2) === 'string' || typeof(object2) === 'number' || object2 instanceof String) {
            logObject.extraMessage = object2.toString()
        } else if (typeof(object2) === 'object') {
            logObject = Object.assign({}, logObject, object2)
            if (object2.hasOwnProperty('itemFileData')) {
                delete logObject.itemFileData
                logObject.itemFileData = object2.itemFileData.length
            }
        }
    }
    if (level === "warn") {
        logger1.warning(logString, logObject)
        logger2.warning(logString, logObject)
        console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}][${proccess}] ${text}`.black.bgYellow)
    } else if (level === "error") {
        logger1.error(logString, logObject)
        logger2.error(logString, logObject)
        console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}][${proccess}] ${text}`.black.bgRed)
    } else if (level === "critical") {
        logger1.critical(logString, logObject)
        logger2.critical(logString, logObject)
        console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}][${proccess}] ${text}`.bgMagenta)
    } else if (level === "alert") {
        logger1.alert(logString, logObject)
        logger2.alert(logString, logObject)
        console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}][${proccess}] ${text}`.red)
    } else if (level === "emergency") {
        logger1.emergency(logString, logObject)
        logger2.emergency(logString, logObject)
        console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}][${proccess}] ${text}`.bgMagenta)
        sleep(250).then(() => {
            process.exit(4);
        })
    } else if (level === "notice") {
        logger1.notice(logString, logObject)
        logger2.notice(logString, logObject)
        console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}][${proccess}] ${text}`.green)
    } else if (level === "alert") {
        logger1.alert(logString, logObject)
        logger2.alert(logString, logObject)
        console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}][${proccess}] ${text}`.green)
    } else if (level === "debug") {
        logger1.debug(logString, logObject)
        logger2.debug(logString, logObject)
        if (text.includes("New Message: ") || text.includes("Reaction Added: ")) {
            console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}][${proccess}] ${text}`.black.bgCyan)
        } else if (text.includes('Message Deleted: ') || text.includes('Reaction Removed: ')) {
            console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}][${proccess}] ${text}`.black.bgBlue)
        } else if (text.includes('Send Message: ')) {
            console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}][${proccess}] ${text}`.black.bgGreen)
        } else {
            console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}][${proccess}] ${text}`.gray)
        }
    } else if (level === "info") {
        logger1.info(logString, logObject)
        logger2.info(logString, logObject)
        if (text.includes("Sent message to ") || text.includes("Connected to Kanmi Exchange as ")) {
            console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}][${proccess}] ${text}`.gray)
        } else {
            console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}][${proccess}] ${text}`.blue)
        }
    } else {
        logger1.error(logString, logObject)
        logger2.error(logString, logObject)
        console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}][${proccess}] ${text}`)
    }
}

printLine("Init", "Discord I/O", "info");
printLine("Discord", "Settings up Discord bot", "debug")
const discordClient = new eris.CommandClient(systemglobal.DiscordToken, {
    compress: true,
    restMode: true,
}, {
    name: "Gotcha",
    description: "Message Monitoring System",
    owner: "Yukimi Kazari",
    restMode: true,
});

function refreshLocalCache() {

}

let init = 0;
let selfstatic = {};

discordClient.on("ready", () => {
    printLine("Discord", "Connected successfully to Discord!", "debug")
    discordClient.getSelf()
        .then(function(data) {
            selfstatic = data
            printLine("Discord", `Using Account: ${selfstatic.username} (${selfstatic.id})`, "debug")
        })
        .catch((er) => {
            printLine("Discord", "Error getting self identification, this is a major issue", "emergency", er)
            console.log(`${er.message}`.bgRed)
        });
    // Refresh Local Role Caches
    refreshLocalCache()
    setInterval(refreshLocalCache, 60000);
    if (init === 0) {
        discordClient.editStatus( "dnd",{
            name: 'Initializing System',
            type: 0
        })
        printLine("Discord", "Registering Commands", "debug")
        init = 1
    }
    setTimeout(() => {
        discordClient.editStatus( "online",{
            name: 'you!',
            type: 2
        })
    }, 30000)
});
discordClient.on("error", (err) => {
    printLine("Discord", "Shard Error, Rebooting...", "error", err)
    console.log(`${err.message}`.bgRed)
    discordClient.connect()
});

discordClient.on("messageCreate", (msg) => {
    let attachmentsURLs = [];
    msg.attachments.forEach((attachment) => {
        attachmentsURLs.push(attachment.url)
    })
    printLine("NewMessage", `New Message from ${msg.author.username}#${msg.author.discriminator} in ${msg.channel.name}: "${msg.content}"`, 'info', {
        id: msg.id,
        guild: msg.guildID,
        channel: msg.channel.id,
        channelname: msg.channel.name,
        user: msg.author.id,
        username: `${msg.author.username}#${msg.author.discriminator}`,
        date: msg.timestamp,
        content: msg.content,
        attachments: attachmentsURLs
    })
});
discordClient.on('messageUpdate', (msg, prevmsg) => {
    let attachmentsURLs = [];
    msg.attachments.forEach((attachment) => {
        attachmentsURLs.push(attachment.url)
    })
    printLine("EditMessage", `Edited Message from ${msg.author.username}#${msg.author.discriminator} in ${msg.channel.name}: "${msg.content}"`, 'info', {
        id: msg.id,
        guild: msg.guildID,
        channel: msg.channel.id,
        channelname: msg.channel.name,
        user: msg.author.id,
        username: `${msg.author.username}#${msg.author.discriminator}`,
        date: msg.timestamp,
        content: msg.content,
        prev_content: prevmsg.content,
        attachments: attachmentsURLs
    })
})
discordClient.on("messageDelete", (msg) => {
    printLine("DeleteMessage", `Deleted Message from ${msg.id} in ${msg.channel.name}`, 'info', {
        id: msg.id,
        guild: msg.guildID,
        channel: msg.channel.id,
        channelname: msg.channel.name,
    })
})
discordClient.on("messageDeleteBulk", (msg_array) => {
    msg_array.forEach((msg) => {
        printLine("DeleteMessage", `Deleted Message from ${msg.id} in ${msg.channel.name}"`, 'info', {
            id: msg.id,
            guild: msg.guildID,
            channel: msg.channel.id,
            channelname: msg.channel.name,
        })
    })
})

discordClient.connect();
