const Discord = require("discord.js");
const rbx = require("roblox-js");
const rethink = require("rethinkdb");
const raven = require("raven");

async function createRoleBinds(message, data, roleInfo){
  let bindInfo = [];
  function getData(tbl){
    return tbl.guildID === message.guild.id
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
        let dataResult = result.find(getData);
        if(dataResult){
          bindInfo = dataResult.binds;
          for(let info of roleInfo){
            bindInfo.push({groupID: data.groupID, rank: info["Rank"], role: info["Name"]});
          };
          rethink.db("settings").table("roleBindings_settings").get(dataResult.id).update({guildID: message.guild.id, binds: bindInfo}).run(conn, function(err, res){
            if(err){
              console.log(err);
              return raven.captureException(err);
            };
            //console.log(bindInfo.length);
            console.log(res);
          });
          message.channel.send("<@" + message.author.id + ">", {embed:{
            color: 15844367,
            fields: [{
                name: "Success",
                value: `Successfully created the following binds: \n\n **GroupID:** \`${data.groupID}\` \n **Rank:** \`${bindInfo.map(i=> i.rank).join(", ")}\` \n **Role Name:** \`${bindInfo.map(i=> i.role).join(", ")}\``
            }],
          }});
          bindInfo = [];
          return;
        }else{
          for(let info of roleInfo){
            bindInfo.push({groupID: data.groupID, rank: info["Rank"], role: info["Name"]});
          };
          rethink.db("settings").table("roleBindings_settings").insert({guildID: message.guild.id, binds: bindInfo}).run(conn, function(err, res){
            if(err){
              console.log(err);
              return raven.captureException(err);
            };
            console.log(res);
          });
          message.channel.send("<@" + message.author.id + ">", {embed:{
            color: 15844367,
            fields: [{
                name: "Success",
                value: `Successfully created the following binds: \n\n **GroupID:** \`${data.groupID}\` \n **Rank:** \`${bindInfo.map(i=> i.rank).join(", ")}\` \n **Role Name:** \`${bindInfo.map(i=> i.role).join(", ")}\``
            }],
          }});
          bindInfo = [];
          return;
        };
      });
    });
  });
}

async function createRoles(message, data){
  let createdRoles = [];
  let roles = await rbx.getRoles(data.groupID);
  roles.forEach(async(roleInfo) => {
    if(!message.guild.roles.find("name", roleInfo["Name"])){
      createdRoles.push(roleInfo["Name"]);
      try{
        discordRole = await message.guild.createRole({
          name: roleInfo["Name"]
        });
      }catch(err){
        console.log(err);
        return raven.captureException(err);
      };
    };
  });
  return createRoleBinds(message, data, roles);
}

module.exports.run = async(bot, message, args) => {

  function getData(tbl){
    return tbl.guildID === message.guild.id;
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
        const dataResult = result.find(getData);
        if(dataResult){
          return createRoles(message, dataResult);
        }else{
          message.channel.send("<@" + message.author.id + ">", {embed:{
            color: 15158332,
            fields: [{
              name: "Error",
              value: "There is not the necessary group setting informaiton set yet to run this command \n\n Please run the command **-setgroup [id]** and set a group ID before running this command"
            },
          ],
          }});
        };
      });
    });
  })

};

module.exports.config = {
  name: "massbind",
  aliases: []
}
