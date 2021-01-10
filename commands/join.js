const Discord = require("discord.js");
const rethink = require("rethinkdb");
const raven = require("raven");

function find(array, roleName){
  for(i = 0; i < array.length; i++){
    if(array[i] == roleName){
      return array[i]
    };
  };
}

module.exports.run = async(bot, message, args) => {

  let roleName = args.slice(0).join(" ");

  function getData(tbl){
    return tbl.guildID === message.guild.id;
  };

  if(!args[0]){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "Please specify a role name to join"
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
          let role = find(dataResult.roles, roleName);
          if(role){
            let discordRole = message.guild.roles.find("name", role);
            if(discordRole){
              message.member.addRole(discordRole);
              return message.channel.send("<@" + message.author.id + ">", {embed:{
                color: 15844367,
                fields: [{
                    name: "Success",
                    value: `Successfully joined the following role \`${discordRole.name}\``
                }],
              }});
            }else{
              return message.channel.send({embed:{
                color: 15158332,
                fields: [{
                  name: "Error",
                  value: "That role does not exist"
                },
              ],
              }});
            };
          }else{
            return message.channel.send({embed:{
              color: 15158332,
              fields: [{
                name: "Error",
                value: "That role does not exist"
              },
            ],
            }});
          }
        }else{
          return message.channel.send({embed:{
            color: 15158332,
            fields: [{
              name: "Error",
              value: "There are currently no public roles set for this server"
            },
          ],
          }});
        };
      });
    });
  });

}

module.exports.config = {
  name: "join",
  aliases: []
}
