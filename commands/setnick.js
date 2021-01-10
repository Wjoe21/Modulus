const Discord = require("discord.js");
const fs = require("fs");
const rethink = require("rethinkdb");
const raven = require("raven");
const snekfetch = require("snekfetch");

async function setNickname(message, args){
  function getData(tbl){
    return tbl.guildID === message.guild.id
  };
  rethink.connect({host: "localhost", port: 28015}, function(err, conn){
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
          console.log("yes there is data when running setnick");
          rethink.db("settings").table("group_settings").get(dataResult.id).update({guildID: message.guild.id, groupID: dataResult.groupID, nicknameTemplate: args[0]}).run(conn, function(err, res){
            if(err){
              console.log(err);
              return raven.captureException(err);
            };
            console.log(res);
            return message.channel.send("<@" + message.author.id + ">", {embed:{
              color: 15844367,
              fields: [{
                  name: "Success",
                  value: `Successfully set the nickname template to \`${args[0]}\``
                }],
            }});
          });
        }else{
          console.log("yes no data when running setnick");
          rethink.db("settings").table("group_settings").insert({guildID: message.guild.id, groupID: 0, nicknameTemplate: args[0]}).run(conn, function(err, res){
            if(err){
              console.log(err);
              return raven.captureException(err);
            };
            console.log(res);
            return message.channel.send("<@" + message.author.id + ">", {embed:{
              color: 15844367,
              fields: [{
                  name: "Success",
                  value: `Successfully set the nickname template to \`${args[0]}\``
                }],
            }});
          });
        };
      });
    });
  });
};

module.exports.run = async(bot, message, args) => {

  let nicknameTypes = {
    "Standard": true,
    "Reverse": true,
    "RobloxInfo": true,
    "RobloxName": true,
    "DiscordName": true
  }

  if(!message.member.hasPermission("MANAGE_ROLES")){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "You must have the permission **MANAGE_ROLES** to run this command"
      },
    ],
    }});
  };

  if(!args[0]){
    return message.channel.send("<@" + message.author.id + ">", {embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "Please select from a template below. When you have chosen a template you would like to use, run the command **-setnick [templateName]** \n Your current nickname template is \`${settings[message.guild.id].nicknameTemplate}\` \n\n **Standard -** \`{robloxName | rankName}\` \n **Reverse -** \`{rankName | robloxName}\` \n **RobloxInfo -** \`{robloxName | robloxID}\` \n **RobloxName -** \`{robloxName}\` \n **DiscordNickname -** \`{discordNickname}\`"
      },
    ],
    }});
  };

  if(!nicknameTypes[args[0]]){
    return message.channel.send("<@" + message.author.id + ">", {embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: `${args[0]} is not a valid **nickname template.** The list of valid nickname templates are: \n\n **Standard -** \`{robloxName | rankName}\` \n **Reverse -** \`{rankName | robloxName}\` \n **RobloxInfo -** \`{robloxName | robloxID}\` \n **RobloxName -** \`{robloxName}\` \n **DiscordNickname -** \`{discordNickname}\``
      },
    ],
    }});
  };

  return setNickname(message, args);

  // let settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
  //
  // if(!settings[message.guild.id]){
  //   settings[message.guild.id] = {
  //     groupID: 0,
  //     groupIDs: [],
  //     nicknameTemplate: "Standard"
  //   };
  // };
  //
  // fs.writeFile("./settings.json", JSON.stringify(settings, null, 2), (err) => {
  //   if(err) return raven.captureException(err);
  // });
  //
  // if(!args[0]){
  //   return message.channel.send("<@" + message.author.id + ">", {embed:{
  //     color: 15158332,
  //     fields: [{
  //       name: "Error",
  //       value: `Please select from a template below. When you have chosen a template you would like to use, run the command **-setnick [templateName]** \n Your current nickname template is \`${settings[message.guild.id].nicknameTemplate}\` \n\n **Standard -** \`{robloxName | rankName}\` \n **Reverse -** \`{rankName | robloxName}\` \n **RobloxInfo -** \`{robloxName | robloxID}\` \n **RobloxName -** \`{robloxName}\` \n **DiscordNickname -** \`{discordNickname}\``
  //     },
  //   ],
  //   }});
  // };
  //
  // if(!nicknameTypes[args[0]]){
  //   return message.channel.send("<@" + message.author.id + ">", {embed:{
  //     color: 15158332,
  //     fields: [{
  //       name: "Error",
  //       value: `${args[0]} is not a valid **nickname template.** The list of valid nickname templates are: \n\n **Standard -** \`{robloxName | rankName}\` \n **Reverse -** \`{rankName | robloxName}\` \n **RobloxInfo -** \`{robloxName | robloxID}\` \n **RobloxName -** \`{robloxName}\` \n **DiscordNickname -** \`{discordNickname}\``
  //     },
  //   ],
  //   }});
  // };
  //
  // if(args[0] === "Standard" && !settings[message.guild.id].groupID == 0){
  //   return message.channel.send("<@" + message.author.id + ">", {embed:{
  //     color: 15158332,
  //     fields: [{
  //       name: "Error",
  //       value: "You must set a group ID before setting the nickname to \`Standard\`"
  //     },
  //   ],
  //   }});
  // };
  //
  // if(args[0] === "Reverse" && !settings[message.guild.id].groupID == 0){
  //   return message.channel.send("<@" + message.author.id + ">", {embed:{
  //     color: 15158332,
  //     fields: [{
  //       name: "Error",
  //       value: "You must set a group ID before setting the nickname to \`Reverse\`"
  //     },
  //   ],
  //   }});
  // };
  //
  // settings[message.guild.id].nicknameTemplate = args[0];
  //
  // // settings[message.guild.id] = {
  // //   //groupID: settings[message.guild.id].groupID,
  // //   nicknameTemplate: args[0]
  // // };
  //
  // fs.writeFile("./settings.json", JSON.stringify(settings, null, 2), (err) => {
  //   if(err) raven.captureException(err);
  // });
  //
  // return message.channel.send({embed:{
  //   color: 15844367,
  //   fields: [{
  //     name: "Success",
  //     value: `Successfully set the nickname template to \`${args[0]}\``
  //   },
  // ],
  // }});

};

module.exports.config = {
  name: "setnick",
  aliases: ["setnickname", "nick"]
}
