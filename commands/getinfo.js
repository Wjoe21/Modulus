const Discord = require("discord.js");
const rbx = require("roblox-js");
const nrbx = require("noblox.js");
const fs = require("fs");
const raven = require("raven");
const rethink = require("rethinkdb");

async function getInfo(type, message, user, playerName, playerID){
  const m = await message.channel.send("Creating player info...");
  const playerInfo = await nrbx.getPlayerInfo(playerID);
  m.edit("<@" + message.author.id + ">", {embed:{
    color: 15844367,
    title: "Player Info",
    url: `https://www.roblox.com/users/${playerID}/profile`,
    fields: [{
      name: "Success",
      value: `**Username:** ${playerInfo.name} \n **UserID:** ${playerInfo.id} \n **Age:** ${playerInfo.age} \n **Join Date:** ${playerInfo.joinDate} \n**Status:** ${playerInfo.status} \n **Blurb:** ${playerInfo.blurb}`
    },
  ],
  }});
};

module.exports.run = async(bot, message, args) => {

  let user = message.guild.member(message.mentions.members.first() || message.guild.members.get(args[0]));

  if(!args[0]){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "Please mention a valid member to **retrieve information from**"
      },
    ],
    }});
  };

  if(!user){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: `I cannot find the user ${message.mentions.members.first()}`
      },
    ],
    }});
  };

  function getData(tbl){
    return tbl.authorID === user.id;
  };

  if(user){
    rethink.connect({host: "localhost", port: 28015}, function(err, conn){
      if(err){
        console.log(err);
        return raven.captureException(err);
      };
      rethink.db("account_links").table("links").run(conn, function(err, cursor){
        if(err){
          console.log(err);
          return raven.captureException(err);
        };
        cursor.toArray(function(err, result){
          if(err){
            console.log(err);
            return raven.captureException(err);
          };
          const dataResult = result.find(getData)
          if(dataResult){
            if(dataResult.verificationCode === "FORCEFULLY VERIFIED"){
              return message.channel.send("<@" + message.author.id + ">",{embed:{
                color: 15158332,
                fields: [{
                  name: "Error",
                  value: `Roblox information for ${user} could not be retrieved because they have been forcefully verified by an administrator. \n\n To properly verify yourself, run the command **-unverify** and then run the command **-link [playerName]** and follow the on-screen instructions`
                },
              ],
              }});
            };
            const playerID = dataResult.playerUserID;
            const playerName = dataResult.playerName;
            return getInfo(true, message, user, playerName, playerID);
          }else{
            return message.channel.send({embed:{
              color: 15158332,
              url: "https://discord.gg/KeVsm2x",
              fields: [{
                name: "Error",
                value: `I could not find an existing link for ${user}, make sure they're verified! If they are not currently verified, have them run the command **-link [playerName]** \n\n If you are still experiencing issues, please join our [support server.](https://discord.gg/KeVsm2x)`
              },
            ],
            }});
          };
        });
      });
    });
  }else if (args[0]){
    let {body} = await snekfetch.get("https://api.rprxy.xyz/groups/" + args[0])
    return getInfo(false, message, user, playerName, playerID);
  };

}

module.exports.config = {
  name: "getinfo",
  aliases: ["whois"]
}
