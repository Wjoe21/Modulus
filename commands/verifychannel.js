const Discord = require("discord.js");
const raven = require("raven");

module.exports.run = async(bot, message, args) => {

  if(!message.member.hasPermission("ADMINISTRATOR")){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "You must have the **ADMINISTRATOR** permission to use this command"
      },
    ],
    }});
  };

  try{

    let overwritesInstructions = [];
    let overwritesVerify = [];

    overwritesInstructions.push({
      id: message.guild.roles.find("name", "@everyone"),
      allowed: ['READ_MESSAGE_HISTORY', 'VIEW_CHANNEL'],
      denied: ['SEND_MESSAGES', 'ADD_REACTIONS']
    });

    overwritesVerify.push({
      id: message.guild.roles.find("name", "@everyone"),
      allowed: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
      denied: ['READ_MESSAGE_HISTORY']
    });

    let verifiedRole = message.guild.roles.find("name", "Verified");
    if(verifiedRole){
      overwritesVerify.push({
        id: verifiedRole,
        allowed: [],
        denied: ['VIEW_CHANNEL']
      });

      overwritesInstructions.push({
        id: verifiedRole,
        allowed: [],
        denied: ['VIEW_CHANNEL']
      });
    };

    let category = await message.guild.createChannel("verification", "category", [{
      id: message.guild.id,
      overwrites: overwritesInstructions
    }]);
    let instructionsChannel = await message.guild.createChannel("verify-instructions", "text", [{
      id: message.guild.id,
      overwrites: overwritesInstructions
    }]);
    let verifyChannel = await message.guild.createChannel("verify", "text", [{
      id: message.guild.id,
      overwrites: overwritesVerify
    }]);

    instructionsChannel.setParent(category.id);
    verifyChannel.setParent(category.id);

    instructionsChannel.send(
      `This server uses a Roblox verification system. In order to unlock all the features of this server, you'll need to verify your Roblox account with your Discord account! Begin by saying \`-verify [playerName]\` in ${verifyChannel} and then following the on-screen instructions`
    );

  }catch(err){
    console.log(err);
    return raven.captureException(err);
  };

}

module.exports.config = {
  name: "verifychannel",
  aliases: []
}
