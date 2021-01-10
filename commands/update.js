const Discord = require("discord.js");
const rbx = require("roblox-js");
const fs = require("fs");
const raven = require("raven");
const rethink = require("rethinkdb");

// const settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
// const codes = JSON.parse(fs.readFileSync("./codes.json", "utf8"));
//
// async function getUpdatedRoles(message, user, playerID){
//   var rolesGave = [];
//   settings[message.guild.id].groupIDs.forEach(async(id) => {
//     const groupRankName = await rbx.getRankNameInGroup(id, playerID);
//     console.log(groupRankName);
//     let discordRole = message.guild.roles.find("name", groupRankName);
//     if(!discordRole){
//       newRole = await message.guild.createRole({
//         name: groupRankName
//       });
//     };
//     rolesGave.push(groupRankName);
//     await user.addRole(discordRole || newRole);
//     // return message.channel.send("<@" + message.author.id + ">", {embed:{
//     //   color: 15844367,
//     //   fields: [{
//     //     name: "Success",
//     //     value: `Successfully given ${user} the role **${groupRankName}**`
//     //   }],
//     // }});
//   });
//   const m = await message.channel.send("Sending...");
//   m.edit("<@" + message.author.id + ">", {embed:{
//     color: 15844367,
//     fields: [{
//         name: "Success",
//         value: `Successfully given the following roles to ${user}: \n **-** ${rolesGave.join('\n **- **')}`
//       }],
//   }});
//   rolesGave = [];
//   return undefined;
// };

module.exports.run = async(bot, message, args) => {

  let user = message.guild.member(message.mentions.members.first() || message.guild.members.get(args[0]));

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

  if(!args[0]){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "Please mention a valid member to **update**"
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

  // rethink.connect({host: "localhost", port: 28015}, function(err, conn){
  //   if(err){
  //     console.log(err);
  //     return raven.captureException(err);
  //   };
  //   rethink.db("account_links").table("links").run(conn, function(err, cursor){
  //     if(err){
  //       console.log(err);
  //       return raven.captureException(err);
  //     };
  //     cursor.toArray(function(err, result){
  //       if(err){
  //         console.log(err);
  //         return raven.captureException(err);
  //       };
  //       const dataResult = result.find(getData)
  //       if(dataResult){
  //         console.log(dataResult);
  //         const playerID = dataResult.playerUserID;
  //         return getUpdatedRoles(message, user, playerID);
  //       }else{
  //         return message.channel.send({embed:{
  //           color: 15158332,
  //           url: "https://discord.gg/KeVsm2x",
  //           fields: [{
  //             name: "Error",
  //             value: `I could not find an existing link for ${user}, make sure they're verified! If they are not currently verified, have them run the command **-link [playerName]** \n\n If you are still experiencing issues, please join our [support server.](https://discord.gg/KeVsm2x)`
  //           },
  //         ],
  //         }});
  //       };
  //     });
  //   });
  // });

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
          return message.channel.send({embed:{
            color: 15158332,
            fields: [{
              name: "Error",
              value: `${user} already has a verified account. Please run this command on someone who is currently not verified`
            },
          ],
          }});
        }else{
          rethink.db("account_links").table("links").insert({authorID: user.id, verificationCode: "FORCEFULLY VERIFIED", playerName: `Roblox`, playerUserID: "12345"}).run(conn, function(err, res){
            if(err){
              console.log(err);
              return raven.captureException(err);
            };
            console.log(res);
            let discordRole = message.guild.roles.find("name", "Verified");
            if(discordRole){
              user.addRole(discordRole);
            };
            return message.channel.send("<@" + message.author.id + ">", {embed:{
              color: 15844367,
              fields: [{
                name: "Success",
                value: `Successfully forced verified ${user}. Their temporary username is \`Roblox\`, and their user ID is \`12345\` \n\n If they would like to run the command **-getroles**, they must have a Roblox account properly linked`
              },
            ],
            }});
          });
        };
      });
    });
  });

};

module.exports.config = {
  name: "update",
  aliases: ["updatelink"]
}
