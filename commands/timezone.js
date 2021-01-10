const Discord = require("discord.js");
const snekfetch = require("snekfetch");

module.exports.run = async(bot, message, args) => {
  console.log(args[0], args[1]);
  let time = args[0];
  let timeDay = args[1];
  message.channel.send("In Greenville, it is: " + time + timeDay);

  

};

module.exports.config = {
  name: "timezone",
  aliases: []
}
