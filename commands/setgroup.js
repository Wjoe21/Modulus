const Discord = require("discord.js");
const fs = require("fs");
const rethink = require("rethinkdb");
const raven = require("raven");
const snekfetch = require("snekfetch");

async function setServerGroup(message, ID){
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
        let dataResult = result.find(getData)
        if(dataResult){
          console.log("yes, there is existing data when running setgroup");
          rethink.db("settings").table("group_settings").get(dataResult.id).update({guildID: message.guild.id, groupID: ID, nicknameTemplate: dataResult.nicknameTemplate}).run(conn, function(err, res){
            if(err){
              console.log(err);
              return raven.captureException(err);
            };
            console.log(res);
            return message.channel.send("<@" + message.author.id + ">", {embed:{
              color: 15844367,
              fields: [{
                  name: "Success",
                  value: `Successfully set the main group ID to \`${ID}\``
                }],
            }});
          });
        }else{
          rethink.db("settings").table("group_settings").insert({guildID: message.guild.id, groupID: ID, nicknameTemplate: "Standard"}).run(conn, function(err, res){
            if(err){
              console.log(err);
              return raven.captureException(err);
            };
            console.log(res);
            return message.channel.send("<@" + message.author.id + ">", {embed:{
              color: 15844367,
              fields: [{
                  name: "Success",
                  value: `Successfully set the main group ID to \`${ID}\``
                }],
            }});
          });
        };
      });
    });
  });
};

module.exports.run = async(bot, message, args) => {

  // if(!message.member.hasPermission("ADMINISTRATOR")){
  //   return message.channel.send({embed:{
  //     color: 15158332,
  //     fields: [{
  //       name: "Error",
  //       value: "You must have the permission **ADMINISTRATOR** to run this command"
  //     },
  //   ],
  //   }});
  // };
  //
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
  //   return message.channel.send({embed:{
  //     color: 15158332,
  //     fields: [{
  //       name: "Error",
  //       value: `The current main group is \`${settings[message.guild.id].groupID}\` To change this group to a different run, please run **-setgroup [id]** \n\n Please input a valid **group ID**`
  //     },
  //   ],
  //   }});
  // };
  //
  // settings[message.guild.id].groupID = args[0];
  //
  // fs.writeFile("./settings.json", JSON.stringify(settings, null, 2), (err) => {
  //   if(err) raven.captureException(err);
  // });
  //
  // return message.channel.send({embed:{
  //   color: 15844367,
  //   fields: [{
  //     name: "Success",
  //     value: `Successfully set the main binded group to \`${args[0]}\``
  //   },
  // ],
  // }});

  const ID = Number(args[0]);
  //const {body} = await snekfetch.get("https://api.rprxy.xyz/groups/" + ID);

  //console.log(typeof(ID), typeof(args[0]));

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

  // if(body.errorCode == "503"){
  //   return message.channel.send({embed:{
  //     color: 15158332,
  //     fields: [{
  //       name: "Error",
  //       value: "Please specify a **valid group ID**"
  //     },
  //   ],
  //   }});
  // };

  if(!args[0]){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "Please input a valid **group ID**"
      },
    ],
    }});
  };

  if(isNaN(ID)){
    console.log(isNaN(ID));
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "Please specify a **valid number**"
      }],
    }});
  };

  return setServerGroup(message, ID);

};

module.exports.config = {
  name: "setgroup",
  aliases: []
}
