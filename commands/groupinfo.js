const Discord = require("discord.js");
const snekfetch = require("snekfetch");

module.exports.run = async(bot, message, args) => {

  let {body} = await snekfetch.get("https://api.rprxy.xyz/groups/" + args[0])

  if(!args[0]){
    return message.channel.send("<@" + message.author.id + ">", {embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "Please enter a **group ID!**"
    }],
    }});
  };

  return message.channel.send("<@" + message.author.id + ">", {embed:{
    color: 15844367,
    url: `https://www.roblox.com/groups/group.aspx?gid=${body.Id}`,
    fields: [
      {
        name: "Success",
        value: `Name: [\`${body.Name}\`](https://www.roblox.com/groups/group.aspx?gid=${body.Id}) \n GroupID: \`${body.Id}\` \n Owner: \`${body.Owner.Name}\` \`(${body.Owner.Id})\` \n Description: ${body.Description} \n Roles: \`${body.Roles.length}\``
      }
    ],
  }});

}

module.exports.config = {
  name: "groupinfo",
  aliases: ["getgroupinfo", "group"]
}
