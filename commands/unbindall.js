const Discord = require("discord.js");
const fs = require("fs");
const rethink = require("rethinkdb");
const raven = require("raven");
const snekfetch = require("snekfetch");

async function unbindAll(message){
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
        let dataResult = result.find(getData);
        if(dataResult){
          console.log("existing data when running unbindall");
          rethink.db("settings").table("roleBindings_settings").get(dataResult.id).delete({returnChanges: true}).run(conn, function(err, res){
            if(err){
              console.log(err);
              return raven.captureException(err);
            };
            console.log(res);
          });
        return message.channel.send("<@" + message.author.id + ">", {embed:{
          color: 15844367,
          fields: [{
              name: "Success",
              value: "Successfully deleted all existing role binds"
            }],
          }});
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
};

module.exports.run = async(bot, message, args) => {

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

  unbindAll(message);

};

module.exports.config = {
  name: "unbindall",
  aliases: ["unbindallranks", "unbindranks"]
}
