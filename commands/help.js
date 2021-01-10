const Discord = require("discord.js");

module.exports.run = async(bot, message, args) => {
  message.channel.send("<@" + message.author.id + ">, your DMs have been modulated!");
  return message.author.send({embed:{
    color: 15158332,
    author: {
      name: bot.user.username,
      icon_url: bot.user.avatarURL
    },
    url: "https://discord.gg/KeVsm2x",
    title: "Help",
    description: "A list of commands and their descriptions. Any bugs? DM `Calvin#5198` about it! \n\n If you have any questions or concerns, please join our [support server!](https://discord.gg/KeVsm2x) \n\n",
    fields: [
      {
        name: "-help \n Aliases: info",
        value: "DMs you a list of commands"
      },
      {
        name: "-kick @mention [reason]",
        value: "Kicks a user from the server"
      },
      {
        name: "-ban @mention [1y1w1d1h1m1s] [reason]",
        value: "Bans a user from the server, can specify amount of time. A permanent ban with reason would be ban @mention 0 reason"
      },
      {
        name: "-mute @mention [1y1w1d1h1m1s] [reason]",
        value: "Mutes a user throughout the whole server if they are not currently muted"
      },
      {
        name: "-purge [number] \n Aliases: clear, delete, prune",
        value: "Deletes the specified number of messages"
      },
      {
        name: "-ping",
        value: "Pong, echos the response time between the bot and discord"
      },
      {
        name: "-addrole @mention [rolename] \n Aliases: role, rank",
        value: "Adds a user to the specified role name"
      },
      {
        name: "-removerole @mention [rolename] \n Aliases: derole, unrank",
        value: "Removes a specified role from a user"
      },
      {
        name: "-invite",
        value: "Echos back the invite link for Modulus"
      },
      {
        name: "-setprefix [prefix] \n Aliases: prefix",
        value: "Sets the bots prefix to your desired prefix"
      },
      {
        name: "-setgroup [id]",
        value: "Binds the main group ID of the guild"
      },
      {
        name: "-setnick [nicknameTemplate] \n Aliases: setnickname, nick",
        value: "Sets the nickname template for the server. The users nickname changes whenever they have completed their verification process"
      },
      {
        name: "-binds \n Aliases: viewbinds",
        value: "Lists all of the existing binds for your server"
      },
      {
        name: "-bind [id] [rank] [role] \n Aliases: bind",
        value: "Binds an existing Roblox group or Roblox group rank to a Discord role. There is one rank and one role per bind. If you would like everyone in the group to recieve the role, set your rank to \`all\`, otherwise specify a number between 1-255"
      },
      {
        name: "-massbind",
        value: "Takes the main group ID set from **-setgroup** and creates a rank to role bind for each rank in the group"
      },
      {
        name: "-removebind [id] [rank] \n Aliases: delbind, unbind",
        value: "Removes an existing binded group"
      },
      {
        name: "-unbindall",
        value: "Removes all the existing binds for the guild"
      },
      {
        name: "-setup",
        value: "Creates the designated Discord roles from the binded group"
      },
      {
        name: "-create [roleName]",
        value: "Creates a public role for everyone in the server to join"
      },
      {
        name: "-join [roleName]",
        value: "Joins the specified public role"
      },
      {
        name: "-leave [roleName]",
        value: "Leaves the specified role name"
      },
      {
        name: "-vote [input] \n Aliases: poll",
        value: "Initates a poll with the given input and two reactions, yes or no."
      },
      {
        name: "-8ball [input] \n Aliases: 8, ball, fortune",
        value: "Replies back with an 8ball response to your input"
      },
      {
        name: "-verifychannel",
        value: "Creates a verification channel and category in your guild"
      },
      {
        name: "-link [playerName] \n Aliases: linkaccount, verify",
        value: "Starts the verification process for the specified player name"
      },
      {
        name: "-unlink \n Aliases: unverify",
        value: "Unlinks an existing verified Roblox account"
      },
      {
        name: "-done",
        value: "Attempts to verify user with the correct verification code and store their link for future use"
      },
      {
        name: "-getroles \n Aliases: getrole",
        value: "Assigns roles to the user from the binded group if they are currently verified"
      },
      {
        name: "-update @mention \n Aliases: updatelink",
        value: "Forcibly update a users verification status. This is equivalent to running -verify **YOU ARE UNABLE TO RUN -GETROLES IF YOUR VERIFICATION STATUS WAS RAN BY AN UPDATE**"
      },
      {
        name: "-getinfo @mention \n Aliases: whois",
        value: "Returns Roblox information about a verified user"
      },
      {
        name: "-groupinfo [id] \n Aliases: getgroupinfo, group",
        value: "Returns Roblox information about a specified group"
      },
      {
        name: "-settings",
        value: "Displays existing server settings for your server"
      }
    ],
  }});
}

module.exports.config = {
  name: "help",
  aliases: ["info"]
}
