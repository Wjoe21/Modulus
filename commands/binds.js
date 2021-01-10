const Discord = require("discord.js");
const fs = require("fs");
const snekfetch = require("snekfetch");
const rethink = require("rethinkdb");

// var ids = [];
// var canSendEmbed = true;
//
// function getIds(message){
//   let settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
//   if(settings[message.guild.id].groupIDs.length === 0){
//     console.log(true, "no binds");
//     canSendEmbed = false;
//     return;
//   }
//   for(const id of settings[message.guild.id].groupIDs){
//     ids.push(id);
//   };
// };

async function sendEmbed(message, data){
  let bindsEmbed = {
    color: 15844367,
    title: "Binds",
    fields: [],
    footer: {
      text: "Use -delbind to delete a bind, or -bind to add a new bind"
    }
  };
  const m = await message.channel.send("Fetching bind information...");
  for(let info of data){
    const {body} = await snekfetch.get("https://api.rprxy.xyz/groups/" + info.groupID);
    bindsEmbed.fields.push({
      name: body.Name + " ("+body.Id+")",
      value: `**Rank:** ${info.rank} ➜ **Role:** ${info.role}`
    });
  };
  return m.edit({embed: bindsEmbed})
};

module.exports.run = async(bot, message, args) => {

  function getData(tbl){
    return tbl.guildID === message.guild.id;
  };

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

  rethink.connect({host: "localhost", port: 28015}, function(err, conn){
    if(err){
      console.log(err);
      return raven.captureException(err);
    };
    rethink.db("settings").table("roleBindings_settings").run(conn, function(err, cursor){
      if(err){
        console.log(err);
        return raven.captureException(err);
      };
      cursor.toArray(function(err, result){
        if(err){
          console.log(err)
          return raven.captureException(err);
        };
        const dataResult = result.find(getData);
        if(dataResult){
          if(dataResult.binds.length === 0){
            return message.channel.send({embed:{
              color: 15158332,
              fields: [{
                name: "Error",
                value: "There are currently no binds for this server"
              },
            ],
            }});
          };
          sendEmbed(message, dataResult.binds);
        }else{
          return message.channel.send({embed:{
            color: 15158332,
            fields: [{
              name: "Error",
              value: "There are currently no binds for this server"
            },
          ],
          }});
        };
      });
    });
  });

  // let settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
  // settings[message.guild.id].groupIDs.forEach(async(id) => {
  //   let {body} = await snekfetch.get("https://api.rprxy.xyz/groups/" + id)
  //   const m = await message.channel.send("Sending...")
  //
  //   if(body.code === `500`){
  //     return message.channel.send({embed:{
  //       color: 15158332,
  //       fields: [{
  //         name: "Error",
  //         value: "<@" + message.author.id + ">, I have encountered an **InternalServerError** when searching for your Roblox group. \n Are you sure the provided group ID bind exists?"
  //       },
  //     ],
  //     }});
  //   };
  //
  //   m.edit({embed:{
  //       color: 15844367,
  //       fields: [{
  //         name: "Success",
  //         value: `\n **Group name:** ${body.Name} \n **GroupID:** ${body.Id} \n **Owner:** ${body.Owner.Name}`
  //       },
  //     ],
  //   }});
  // });

  // getIds(message);
  // if(canSendEmbed === false){
  //   message.channel.send({embed:{
  //     color: 15158332,
  //     fields: [{
  //       name: "Error",
  //       value: "I could not find any existing binds for this server"
  //     },
  //   ],
  //   }});
  //   canSendEmbed = true;
  //   return undefined;
  // };
  //
  // let count = 1;
  //
  // let bindsEmbed = {
  //   color: 15844367,
  //   fields: []
  // };
  //
  // for(const id of ids){
  //   let {body} = await snekfetch.get("https://api.rprxy.xyz/groups/" + id)
  //   bindsEmbed.fields.push({
  //     name: "Bind " + count++,
  //     value: `\n **Group name:** ${body.Name} \n **GroupID:** ${body.Id} \n **Owner:** ${body.Owner.Name}`
  //   });
  // };
  //
  // ids = [];
  // count = 1;
  //
  // return message.channel.send({embed: bindsEmbed});

};

module.exports.config = {
  name: "binds",
  aliases: ["viewbinds"]
}
