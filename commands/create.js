const Discord = require("discord.js");
const rethink = require("rethinkdb");
const raven = require("raven");

module.exports.run = async(bot, message, args) => {

  let roleName = args.slice(0).join(" ");
  var roleInfo = [];

  function getData(tbl){
    return tbl.guildID === message.guild.id;
  };

  if(!message.member.hasPermission("MANAGE_SERVER")){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "You must have the **MANAGE_SERVER** permission to use this command"
      },
    ],
    }});
  };

  if(!args[0]){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "Please specify a role name to create"
      },
    ],
    }});
  };

  rethink.connect({host: "localhost", port: 28015}, function(err, conn){
    if(err){
      console.log(err);
      return raven.captureException(err);
    };
    rethink.db("settings").table("public_roles").run(conn, function(err, cursor){
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
          roleInfo = dataResult.roles;
          roleInfo.push(roleName);
          rethink.db("settings").table("public_roles").get(dataResult.id).update({guildID: message.guild.id, roles: roleInfo}).run(conn, function(err, res){
            if(err){
              console.log(err);
              return raven.captureException(err);
            };
            console.log(res);
            roleInfo = [];
          });
          return message.channel.send("<@" + message.author.id + ">", {embed:{
            color: 15844367,
            fields: [{
                name: "Success",
                value: `Successfully created the following role \`${roleName}\``
            }],
          }});
        }else{
          roleInfo.push(roleName);
          rethink.db("settings").table("public_roles").insert({guildID: message.guild.id, roles: roleInfo}).run(conn, function(err, res){
            if(err){
              console.log(err);
              return raven.captureException(err);
            };
            console.log(res);
          });
          roleInfo = [];
          return message.channel.send("<@" + message.author.id + ">", {embed:{
            color: 15844367,
            fields: [{
                name: "Success",
                value: `Successfully created the following role \`${roleName}\``
            }],
          }});
        };
      });
    });
  });

  roleObj = await message.guild.createRole({
    name: roleName
  });

}

module.exports.config = {
  name: "create",
  aliases: []
}
