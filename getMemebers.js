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
    discordClient.getRESTGuildMembers(process.argv[2])
        .then((members) => {
            console.log(`Server Members : ${process.argv[2]}`)
            members.forEach((member) => {
                console.log(`${member.id} - ${member.username} (${member.nick})`)
            })
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