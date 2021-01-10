const Discord = require("discord.js");
const rbx = require("roblox-js");
const fs = require("fs");
const raven = require("raven");
const rethink = require("rethinkdb");

async function createBinds(message, grpID, roleInfo){
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
            bindInfo.push({groupID: grpID, rank: info["Rank"], role: info["Name"]});
          };
          rethink.db("settings").table("roleBindings_settings").get(dataResult.id).update({guildID: message.guild.id, binds: bindInfo}).run(conn, function(err, res){
            if(err){
              console.log(err);
              return raven.captureException(err);
            };
            //console.log(bindInfo.length);
            console.log(res);
            bindInfo = [];
          });
        }else{
          for(let info of roleInfo){
            bindInfo.push({groupID: grpID, rank: info["Rank"], role: info["Name"]});
          };
          rethink.db("settings").table("roleBindings_settings").insert({guildID: message.guild.id, binds: bindInfo}).run(conn, function(err, res){
            if(err){
              console.log(err);
              return raven.captureException(err);
            };
            console.log(res);
          });
          bindInfo = [];
        };
      });
    });
  });
};

async function setupRoles(message, groupID){
  var createdRoles = [];
  let roles = await rbx.getRoles(groupID);
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
  createBinds(message, groupID, roles)
  const m = await message.channel.send("Creating...");
  m.edit({embed:{
    color: 15844367,
    fields: [
      {
        name: "Success",
        value: `Successfully created the following roles: \n **-** ${createdRoles.join('\n **- **')}`
      },
      {
        name: "Missing Roles?",
        value: "If a role name already exists, then the bot will not create a new one"
      },
      {
        name: "Next Step",
        value: "You may color the roles and do as you feel with the roles, the permissions are default"
      }
    ]
  }});
  createdRoles = [];
  return;
};

module.exports.run = async(bot, message, args) => {

  function getData(tbl){
    return tbl.guildID === message.guild.id
  };

  if(!message.member.hasPermission("ADMINISTRATOR")){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "You must have the permission **ADMINISTRATOR** to run this command"
      },
    ],
    }});
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
          return setupRoles(message, dataResult.groupID);
        }else{
          return message.channel.send({embed:{
            color: 15158332,
            fields: [{
              name: "Error",
              value: "You have not setup all the necessary info to run this command. Make sure you have a group ID set by running the command `-setgroup [id]`"
            },
          ],
          }});
        };
      });
    });
  });

  // var createdRoles = []
  //
  // let roles = await rbx.getRoles(settings[message.guild.id].groupID);
  // roles.forEach(async(roleInfo) => {
  //   if(!message.guild.roles.find("name", roleInfo["Name"])){
  //     createdRoles.push(roleInfo["Name"]);
  //     try{
  //       discordRole = await message.guild.createRole({
  //         name: roleInfo["Name"]
  //       });
  //     }catch(err){
  //       console.log(err);
  //       return raven.captureException(err);
  //     };
  //   };
  //   // const msg = await message.channel.send("Creating...")
  //   // msg.edit({embed:{
  //   //   color: 15844367,
  //   //   fields: [{
  //   //     name: "Success",
  //   //     value: `Successfully created the following roles: \n\n - ${roleInfo["Name"]}`
  //   //   },
  //   // ],
  //   // }});
  // });
  //
  // const m = await message.channel.send("Creating...");
  //
  // m.edit({embed:{
  //   color: 15844367,
  //   fields: [
  //     {
  //       name: "Success",
  //       value: `Successfully created the following roles: \n **-** ${createdRoles.join('\n **- **')}`
  //     },
  //     {
  //       name: "Missing Roles?",
  //       value: "If a role name already exists, then the bot will not create a new one"
  //     },
  //     {
  //       name: "Next Step",
  //       value: "You may color the roles and do as you feel with the roles, the permissions are default"
  //     }
  //   ]
  // }});
  //
  // createdRoles = [];
  //
  // return;

  // for(const role of createdRoles){
  //   // bindsEmbed.fields.push({
  //   //   name: "Success",
  //   //   value: role
  //   // });
  //   m.edit({embed:{
  //     color: 15844367,
  //     fields: [{
  //         name: "Success",
  //         value: `Successfully created the following roles: \n${role}`
  //     }]
  //   }});
  // };

  // m.edit({embed:{
  //   color: 15844367,
  //   fields: [{
  //       name: "Successfully created the following roles",
  //       value: `\n${role}`
  //   }]
  // }}):

  // let bindsEmbed = {
  //   color: 15844367,
  //   fields: [{
  //     name: "Successfully created the following roles",
  //     value: "."
  //   }]
  // };

  //return message.channel.send({embed: bindsEmbed});


  // let roleEmbed = {
  //   color: 15844367,
  //   fields: []
  // };
  // roleEmbed.fields.push({
  //   name: "Success",
  //   value: roles["Name"]
  // })
  // return message.channel.send({embed: roleEmbed});

  // rbx.getRoles(settings[message.guild.id].groupID)
  // .then(function(roles) {
  //   roles.forEach(async(roleInfo) => {
  //     if(!message.guild.roles.find("name", roleInfo["Name"])){
  //       try{
  //         role = await message.guild.createRole({
  //           name: roleInfo["Name"]
  //         });
  //       }catch(err){
  //         console.log(err);
  //         return raven.captureException(err);
  //       }
  //     };
  //     createdRoles.push(role);
  //     console.log(createdRoles);
  //     let roleEmbed = {
  //       color: 15844367,
  //       fields: []
  //     };
  //     for(const role of createdRoles){
  //       roleEmbed.fields.push({
  //         name: 'Success',
  //         value: "Blah blah blah " + role.name
  //       })
  //       message.channel.send({embed: roleEmbed});
  //     }
  //     // let msg = await message.channel.send("Creating...");
  //     // msg.edit({embed:{
  //     //   color: 15844367,
  //     //   fields: [
  //     //   {
  //     //     name: "Success",
  //     //     value: `Successfully created the following roles: \n\n - ${roleInfo["Name"]}`
  //     //   },
  //     //   {
  //     //     name: "Missing Roles",
  //     //     value: "If a role with a rank name already exists, a new one will not be created."
  //     //   },
  //     // ],
  //     // }});
  //   });
  // });

}

module.exports.config = {
  name: "setup",
  aliases: []
}
