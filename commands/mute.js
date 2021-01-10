const Discord = require("discord.js");
const ms = require("ms");
const raven = require("raven");

module.exports.run = async(bot, message, args) => {

  if(!message.member.hasPermission("MANAGE_MESSAGES")){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "You must have the permission **MANAGE_MESSAGES** to run this command"
      },
    ],
    }});
  }

  let muteUser = message.mentions.members.first() || message.guild.members.get(args[0]);
  let muteRole = message.guild.roles.find(`name`, "muted")

  if(!muteUser){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: `I cannot find the user ${message.mentions.members.first()}`
      },
    ],
    }});
  };
  if(!muteRole){
    try{
      muteRole = await message.guild.createRole({
          name: "Muted",
          color: "#e8e2de",
          permissions: []
      });
      message.guild.channels.forEach(async (channel) => {
        await channel.overwritePermissions(muteRole, {
          "SEND_MESSAGES": false,
          "ADD_REACTIONS": false,
        })
      })
    }catch(e){
      console.log(e.stack);
      raven.captureException(e);
    }
  }
  let muteTime = args[1];
  if (!muteTime){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "Please specify a time"
      },
    ],
    }});
  }
  await(muteUser.addRole(muteRole.id));
  message.channel.send({embed:{
    color: 15844367,
    fields: [{
      name: "Success",
      value: `<@${muteUser.id}> has been muted for ${ms(ms(muteTime))}`
    },
  ],
  }});

  setTimeout(function() {
    muteUser.removeRole(muteRole.id)
  }, ms(muteTime))

}

module.exports.config = {
  name: "mute",
  aliases: []
}
