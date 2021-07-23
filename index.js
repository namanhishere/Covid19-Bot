require("dotenv").config()
const axios = require('axios');
const csv = require('csvtojson')
const fs = require("fs")
let link = "https://vnexpress.net/microservice/sheet/type/covid19_2021_by_day"
const Discord = require("discord.js")
const client = new Discord.Client()
client.login(process.env.token)



function getData(params) {
    axios.get(link)
        .then(function (response) {
            csv({ noheader: false })
                .fromString(response.data)
                .then((jsonObj) => {
                    let nowtime = new Date() 
                    client.channels.cache.get("865175546640072745").send(`[${nowtime.getHours()}:${nowtime.getMinutes()}:${nowtime.getSeconds()}][${nowtime.getFullYear() + "/" + (nowtime.getMonth() + 1) + "/" + nowtime.getDate()}] Making Request Success`)
                    let day = jsonObj.find(({ day_full }) => day_full === nowtime.getFullYear() + "/" + (nowtime.getMonth() + 1) + "/" + nowtime.getDate())
                    if (!fs.existsSync("./data.json")) return fs.writeFileSync('data.json', JSON.stringify(day))
                    let old_data = require("./data.json")
                    if (old_data["CỘNG ĐỒNG"] == day["CỘNG ĐỒNG"]) return
                    fs.writeFileSync('data.json', JSON.stringify(day))
                    let message = `**Cập nhật vào lúc ${nowtime.getHours()} giờ ${nowtime.getMinutes()} phút Ngày ${nowtime.getDate()} Tháng ${(nowtime.getMonth() + 1)} Năm ${nowtime.getFullYear()}**\nViệt Nam ghi nhận tổng cộng **${day["CỘNG ĐỒNG"]}** ca mắc mới tại **${day.city_by_day}** tỉnh thành.\nTrong đó có **${day.community}** được phát hiện ngoài cộng động, **${day.blockade}** được phát hiện trong khu cách ly.\nNhư vậy, tính từ ngày 27/4 cho tới nay, Việt Nam ghi nhận tổng cộng **${day["TỔNG CỘNG ĐỒNG"]}** ca mắc COVID-19. `
                    client.channels.cache.get("865176721807507467").send(message)
                })
        })
        .catch(function (error) {
            console.log(error);
        })
}

client.on("ready", () => {
    let nowtime = new Date()
    console.log(`[${nowtime.getHours()}:${nowtime.getMinutes()}:${nowtime.getSeconds()}][${nowtime.getFullYear() + "/" + (nowtime.getMonth() + 1) + "/" + nowtime.getDate()}] Bot Online`)
    client.channels.cache.get("865177293110509568").send(`[${nowtime.getHours()}:${nowtime.getMinutes()}:${nowtime.getSeconds()}][${nowtime.getFullYear() + "/" + (nowtime.getMonth() + 1) + "/" + nowtime.getDate()}] Bot Online`)
     getData()
     setInterval(() => {
         getData()
     }, 30000);
})

client.on("message", async message => {
    if(message.guild.id != "865167859780812810") return
    let nowtime = new Date()
    if (message.channel.type === 'news') {
        message.crosspost()
            .then(() => client.channels.cache.get("865176456194555905").send(`[${nowtime.getHours()}:${nowtime.getMinutes()}:${nowtime.getSeconds()}][${nowtime.getFullYear() + "/" + (nowtime.getMonth() + 1) + "/" + nowtime.getDate()}] Making Announce Message Success`))
            .catch(console.error);
    }
})


client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {

    if(err) console.log(err)

    let jsfile = files.filter(f => f.split(".").pop() === "js") 
    if(jsfile.length <= 0) {
         return console.log("[LOGS] Couldn't Find Commands!");
    }

    jsfile.forEach((f, i) => {
        let pull = require(`./commands/${f}`);
        client.commands.set(pull.config.name, pull);  
        pull.config.aliases.forEach(alias => {
            client.aliases.set(alias, pull.config.name)
        });
    });
});




client.on("message", async message => {
    if(message.author.bot || message.channel.type === "dm") return;

    let prefix = "!!";
    let messageArray = message.content.split(" ")
    let cmd = messageArray[0];
    let args = messageArray.slice(1);


    if(!message.content.startsWith(prefix)) return;
    let commandfile = client.commands.get(cmd.slice(prefix.length)) || client.commands.get(client.aliases.get(cmd.slice(prefix.length)))
    if(commandfile) commandfile.run(client,message,args)
  
})





