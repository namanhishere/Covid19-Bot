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
    }, 180000);
})

client.on("message", async message => {
    let nowtime = new Date()
    if (message.channel.type === 'news') {
        message.crosspost()
            .then(() => client.channels.cache.get("865176456194555905").send(`[${nowtime.getHours()}:${nowtime.getMinutes()}:${nowtime.getSeconds()}][${nowtime.getFullYear() + "/" + (nowtime.getMonth() + 1) + "/" + nowtime.getDate()}] Making Announce Message Success`))
            .catch(console.error);
    }
})
