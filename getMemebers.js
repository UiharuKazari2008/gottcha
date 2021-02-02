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
    console.log(`Server Members : ${process.argv[2]}`)
    discordClient.getRESTGuildMembers(process.argv[2], 1000)
        .then((members) => {
            members.forEach((member) => {
                console.log(`${member.id} - ${member.username} (${member.nick})`)
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