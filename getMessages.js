const systemglobal = require('./config.json');
const eris = require('eris');
const colors = require('colors');

const discordClient = new eris.CommandClient(systemglobal.DiscordToken, {
    compress: true,
    restMode: true,
}, {
    name: "Gotcha",
    description: "Message Monitoring System",
    owner: "Yukimi Kazari",
    restMode: true,
});

let init = 0;
let selfstatic = {};

discordClient.on("ready", () => {
    console.log("Connected successfully to Discord!");
    discordClient.getSelf()
        .then(function(data) {
            selfstatic = data
            console.log(`Using Account: ${selfstatic.username} (${selfstatic.id})`)
        })
        .catch((er) => {
            console.error("Error getting self identification, this is a major issue".bgRed)
            console.error(er)
        });
    discordClient.getMessages(process.argv[2], 100)
        .then((messages) => {
            messages.forEach((message) => {
                console.log(`${message.id} "${message.content}"`)
                if (message.attachments && message.attachments.length > 0) {
                    message.attachments.forEach((attachment) => {
                        console.log(`Attachment: ${attachment.url}`)
                    })
                }
            })
        })
        .then(() => {
            console.log('Finished processing channel!')
            process.exit(0)
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        })
});
discordClient.on("error", (err) => {
    console.error("Shard Error, Rebooting...")
    console.error(err)
    discordClient.connect()
});


discordClient.connect();