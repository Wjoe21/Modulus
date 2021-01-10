const Discord = require("discord.js");
const rbx = require("roblox-js");
const fs = require("fs");
const raven = require("raven");
const rethink = require("rethinkdb");

// var createdRoles = [];
//
// function sendEmbed(message){
//   console.log(createdRoles.length);
//   let rolesEmbed = {
//     color: 15844367,
//     fields: []
//   },
//   for(let role of createdRoles){
//     console.log(role)
//     rolesEmbed.fields.push({
//       name: "Success",
//       value: `\`${role}\``
//     });
//   }
//   return message.channel.send({embed: rolesEmbed})
// };

function getRoles(message, playerID){
  console.log("printing twice?")
  let settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
  settings[message.guild.id].groupIDs.forEach(async(id) => {
    console.log(id);
    const groupRankName = await rbx.getRankNameInGroup(id, playerID);
    if(groupRankName === "Guest") return;
    let discordRole = message.guild.roles.find("name", groupRankName)
    console.log(groupRankName);
    if(message.member.roles.exists("name", groupRankName)){
      return message.channel.send("<@" + message.author.id + ">",{embed:{
        color: 15158332,
        fields: [{
          name: "Error",
          value: "I could not find any roles to give to you"
        },
      ],
      }});
    };
    if(!discordRole){
      console.log("No rolEEEE");
      newRole = await message.guild.createRole({
        name: groupRankName
      });
    };
    //createdRoles.push(groupRankName);
    message.member.addRole(discordRole || newRole);
    return message.channel.send("<@" + message.author.id + ">", {embed:{
      color: 15844367,
      fields: [{
        name: "Success",
        value: `Successfully given you the role **${groupRankName}**`
      }],
    }})
    return undefined;
    //sendEmbed(message);
  });
};

module.exports.run = async(bot, message, args) => {

  let settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
  let codes = JSON.parse(fs.readFileSync("./codes.json", "utf8"));
  let verifiedRole = message.guild.roles.find("name", "Verified");

  if(codes[message.author.id]){
    return message.channel.send("<@" + message.author.id + ">",{embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "Please finish your existing verification process before attempting to run **-getroles**"
      },
    ],
    }});
  };

  rethink.connect({host: "localhost", port: 28015}, function(err, conn){

    if(err){
      console.log(err);
      return raven.captureException(err);
    }

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
        for(let data of result){
          if(data.authorID == message.author.id || message.member.roles.exists("name", "Verified")){
            console.log(true);
            getRoles(message, data.playerUserID);
            if(!message.member.roles.find("name", "Verified")){
              message.member.addRole(verifiedRole);
            };
            //break;
            //return
            // settings[message.guild.id].groupID.forEach(async(id) => {
            //   console.log(id)
            //   const groupRankName = await rbx.getRankNameInGroup(id, data.playerUserID);
            //   let discordRole = message.guild.roles.find("name", groupRankName)
            //   console.log(groupRankName);
            //   if(!discordRole){
            //     console.log("No rolEEEE");
            //     newRole = await message.guild.createRole({
            //       name: groupRankName
            //     });
            //   };
            //   message.member.addRole(discordRole || newRole);
            //   message.channel.send("<@" + message.author.id + ">", {embed:{
            //     color: 15844367,
            //     fields: [{
            //       name: "Success",
            //       value: `Successfully given you the role **${groupRankName}**`
            //     }],
            //   }})
            //   return undefined;
            // });
          }else{
            return message.channel.send("<@" + message.author.id + ">", {embed:{
              color: 15158332,
              url: "https://discord.gg/KeVsm2x",
              fields: [{
                name: "Error",
                value: "I could not find an existing link for you. Please run **-link [playerName]** to run the verification process again \n\n If you are still experiencing issues, please join our [support server.](https://discord.gg/KeVsm2x)"
              },
            ],
            }});
            return undefined;
          };
        };
      });

    });
  });

  // if(data.authorID == message.author.id || message.member.roles.exists("name", "Verified")){
  //   settings[message.guild.id].groupID.forEach(async(id) => {
  //     console.log(id);
  //     console.log("existing groupID");
  //     groupRankName = await rbx.getRankNameInGroup(id, data.playerUserID)
  //     console.log(groupRankName);
  //     let discordRole = message.guild.roles.find("name", groupRankName);
  //     if(!discordRole){
  //       //message.channel.send(`The role ${groupRankName} doesn't exist!\nCreating role now...`).then(message => message.delete(10000));
  //       newRole = await message.guild.createRole({
  //         name: groupRankName
  //       })
  //     };
  //     message.member.addRole(newRole || discordRole)
  //     message.channel.send("<@" + message.author.id + ">", {embed:{
  //       color: 15844367,
  //       fields: [{
  //         name: "Success",
  //         value: `Successfully given you the role **${groupRankName}**`
  //       }],
  //     }})
  //     return undefined;
  //   });
  // }else{
  //   return message.channel.send("<@" + message.author.id + ">", {embed:{
  //     color: 15158332,
  //     url: "https://discord.gg/KeVsm2x",
  //     fields: [{
  //       name: "Error",
  //       value: "I could not find an existing link for you. Please run **-link [playerName]** to run the verification process again \n\n If you are still experiencing issues, please join our [suppot server.](https://discord.gg/KeVsm2x)"
  //     },
  //   ],
  //   }});
  //   return undefined;
  // }
  // };

};

module.exports.config = {
  name: "getrolesOLD",
  aliases: ["getrole"]
}
