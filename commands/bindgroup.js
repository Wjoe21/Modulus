const Discord = require("discord.js");
const fs = require("fs");
const rethink = require("rethinkdb");
const raven = require("raven");
const snekfetch = require("snekfetch");

async function bindRoles(message, args, roleName){
  var bindInfo = [];
  function getData(tbl){
    return tbl.guildID === message.guild.id;
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
          console.log(err);
          return raven.captureException(err);
        };
        const dataResult = result.find(getData);
        if(dataResult){
          //console.log(dataResult);
          bindInfo = dataResult.binds;
          bindInfo.push({groupID: args[0], role: roleName});
          rethink.db("settings").table("roleBindings_settings").get(dataResult.id).update({guildID: message.guild.id, binds: bindInfo}).run(conn, function(err, res){
            if(err){
              console.log(err);
              return raven.captureException(err);
            };
            //console.log(bindInfo.length);
            console.log(res);
            bindInfo = [];
          });
          return message.channel.send("<@" + message.author.id + ">", {embed:{
            color: 15844367,
            fields: [{
                name: "Success",
                value: `Successfully created the following bind: \n\n **GroupID:** \`${args[0]}\` \n **Role Name:** \`${roleName}\``
              }],
          }});
          }else{
            bindInfo.push({groupID: args[0], role: roleName});
            rethink.db("settings").table("roleBindings_settings").insert({guildID: message.guild.id, binds: bindInfo}).run(conn, function(err, res){
              if(err){
                console.log(err);
                return raven.captureException(err);
              };
              console.log(res);
            });
            bindInfo = [];
          return message.channel.send("<@" + message.author.id + ">", {embed:{
            color: 15844367,
            fields: [{
                name: "Success",
                value: `Successfully created the following bind: \n\n **GroupID:** \`${args[0]}\` \n **Role Name:** \`${roleName}\``
              }],
          }});
        };
      });
    });
  });
};

module.exports.run = async(bot, message, args) => {

  let {body} = await snekfetch.get("https://api.rprxy.xyz/groups/" + args[0])
  let roleName = args.slice(2).join(" ");
  let discordRole = message.guild.roles.find("name", roleName);

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

  if(body.code === "500"){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "Please specify a **valid** group ID"
      },
    ],
    }});
  };

  if(!args[0]){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "Please specify a **group ID**"
      },
    ],
    }});
  };

  if(!roleName){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "Please specify a valid **role name**"
      },
    ],
    }});
  };

  if(!discordRole){
    if(!args[1]){
      return message.channel.send({embed:{
        color: 15158332,
        fields: [{
          name: "Error",
          value: `${roleName} is not a valid role, please specify a **valid** role name`
        },
      ],
      }});
    };
  };

  bindRoles(message, args, roleName);

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
  //       value: "Please input a valid **group ID*"
  //     },
  //   ],
  //   }});
  // };
  //
  // settings[message.guild.id].groupIDs.push(args[0]);
  //
  // fs.writeFile("./settings.json", JSON.stringify(settings, null, 2), (err) => {
  //   if(err) raven.captureException(err);
  // });
  //
  // return message.channel.send({embed:{
  //   color: 15844367,
  //   fields: [{
  //     name: "Success",
  //     value: `Successfully binded group \`${args[0]}\` \n\n You may run **-binds** to see existing binds`
  //   },
  // ],
  // }});

};

module.exports.config = {
  name: "bindgroup",
  aliases: []
}
