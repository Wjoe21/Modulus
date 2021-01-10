const Discord = require("discord.js");
const rethink = require("rethinkdb");

async function sendSettingsEmbed(type, message, data){
  if(type === true){
    return message.channel.send("<@" + message.author.id + ">", {embed:{
      color: 15844367,
      fields: [{
          name: `${message.guild.name} Server Settings`,
          value: `Prefix ➜ \`-\` \n GroupID ➜ \`${data.groupID}\` \n Nickname Template ➜ \`${data.nicknameTemplate}\` \n Auto-verification ➜ \`True\` \n Verified Role ➜ \`Verified\``
        }],
    }});
  }else{
    return message.channel.send("<@" + message.author.id + ">", {embed:{
      color: 15844367,
      fields: [{
          name: `${message.guild.name} Server Settings`,
          value: `Prefix ➜ \`-\` \n GroupID ➜ \`Null\` \n nicknameTemplate ➜ \`Standard\` \n Auto-verification ➜ \`True\` \n Verified Role ➜ \`Verified\``
        }],
    }});
  };
};

module.exports.run = async(bot, message, args) => {

  if(!message.member.hasPermission("ADMINISTRATOR")){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "You must have the permission **ADMINISTRATOR** to run this command"
      },
    ],
    }});
  }

  function getData(tbl){
    return tbl.guildID === message.guild.id;
  };

  rethink.connect({host: "localhost", post: 28015}, function(err, conn){
    if(err){
      console.log(err);
      return raven.captureException(err);
    };
    rethink.db("settings").table("group_settings").run(conn, function(err, cursor){
      if(err){
        console.log(err);
        return raven.captureException(err);
      };
      cursor.toArray(function(err, result){
        if(err){
          console.log(err);
          return raven.captureException(err);
        };
        let dataResult = result.find(getData);
        if(dataResult){
          sendSettingsEmbed(true, message, dataResult);
        }else{
          sendSettingsEmbed(false, message, null);
        };
      });
    });
  });
  // message.channel.send({embed:{
  //   color: 15844367,
  //   fields: [
  //   {
  //     name: "Main Menu",
  //     value: "Welcome to the settings menu. From here you will be able to browse various settings for your Discord server and update them. Please ensure you read each message carefully before continuing onwards. **Say the name of the option that you would like to choose**"
  //   },
  //   {
  //     name: "Options",
  //     value: "\n\n**Group** - Allows you to set the group ID for the server to use whenever *-getroles* is ran\n**Settings** - Allows you to edit existing server settings"
  //   }
  // ],
  // }});
}

module.exports.config = {
  name: "settings"
}
