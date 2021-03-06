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
    discordClient.createChannelInvite(process.argv[2], {
        maxUses: 1,
        maxAge: 120
    })
        .then((invite) => {
            console.log(`ChannelInvite created here : "${invite.code}"`);
            process.exit(0);
        })
        .catch((er) => {
            console.error(er);
        })
});
discordClient.on("error", (err) => {
    console.error("Shard Error, Rebooting...")
    console.error(err)
    discordClient.connect()
});


discordClient.connect();