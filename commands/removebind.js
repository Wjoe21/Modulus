const Discord = require("discord.js");
const fs = require("fs");
const raven = require("raven");
const rethink = require("rethinkdb");

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

  if(!args[0]){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "Please specify a valid **binded group ID**"
      },
    ],
    }});
  };

  if(!args[1]){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "Please specify a valid **binded rank**"
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
          console.log("before", dataResult);
          let removeIndex = dataResult.binds.map(function(item) { return item.groupID && item.rank; }).indexOf(args[0] && args[1]);
          dataResult.binds.splice(removeIndex, 1);
          message.channel.send({embed:{
            color: 15844367,
            fields: [{
              name: "Success",
              value: `Successfully removed binded group \`${args[0]}\` with rank \`${args[1]}\` \n\n You may run **-binds** to see existing binds`
            },
          ],
          }});
          rethink.db("settings").table("roleBindings_settings").get(dataResult.id).update({guildID: message.guild.id, binds: dataResult.binds}).run(conn, function(err, res){
            if(err){
              console.log(err);
              return raven.captureException(err);
            };
            return console.log(res);
          });
        };
      });
    });
  });

  // let settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
  //
  // if(!args[0]){
  //   return message.channel.send({embed:{
  //     color: 15158332,
  //     fields: [{
  //       name: "Error",
  //       value: "Please input a valid **binded group ID**"
  //     },
  //   ],
  //   }});
  // };
  //
  // settings[message.guild.id].groupIDs.splice(settings[message.guild.id].groupIDs.indexOf(args[0]), 1);
  //
  // fs.writeFile("./settings.json", JSON.stringify(settings, null, 2), (err) => {
  //   if(err) raven.captureException(err);
  // });
  //
  // return message.channel.send({embed:{
  //   color: 15844367,
  //   fields: [{
  //     name: "Success",
  //     value: `Successfully removed binded group \`${args[0]}\` \n\n You may run **-binds** to see existing binds`
  //   },
  // ],
  // }});



};

module.exports.config = {
  name: "removebind",
  aliases: ["delbind", "unbind"]
}
