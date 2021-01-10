const Discord = require("discord.js");
const fs = require("fs");
const raven = require("raven");
const rethink = require("rethinkdb");

module.exports.run = async(bot, message, args) => {

  let discordRole = message.guild.roles.find("name", "Verified");
  let codes = JSON.parse(fs.readFileSync("./codes.json", "utf8"));

  function getData(tbl){
    return tbl.authorID === message.author.id;
  };

  if(codes[message.author.id]){
    return message.channel.send("<@" + message.author.id + ">", {embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "You currently have a verification attempt on-going. Try again once you have successfully linked your account"
      },
    ],
    }});
  };

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
        const dataResult = result.find(getData);
        if(dataResult){
          console.log(true);
          message.channel.send("<@" + message.author.id + ">", {embed:{
            color: 15844367,
            fields: [{
              name: "Success",
              value: `You have successfully unlinked account \`${dataResult.playerName}\` with user ID \`${dataResult.playerUserID}\``
            },
          ],
          }});
          rethink.db("account_links").table("links").get(dataResult.id).delete({returnChanges: true}).run(conn, function(err, res){
            if(err){
              console.log(err);
              return raven.captureException(err);
            };
            console.log(res);
          });
          return message.member.removeRole(discordRole.id);
        }else{
          return message.channel.send("<@" + message.author.id + ">", {embed:{
            color: 15158332,
            fields: [{
              name: "Error",
              value: "I could not find an existing link for you. Make sure you are already verified! If not, please run the command **-link [playerName]**"
            },
          ],
          }});
        };
        // result.forEach(async(data) => {
        //   if(data.authorID == message.author.id){
        //     console.log(true);
        //     message.channel.send("<@" + message.author.id + ">", {embed:{
        //       color: 15844367,
        //       fields: [{
        //         name: "Success",
        //         value: `You have successfully unlinked account \`${data.playerName}\` with user ID \`${data.playerUserID}\``
        //       },
        //     ],
        //     }});
        //     rethink.db("account_links").table("links").get(data.id).delete({returnChanges: true}).run(conn, function(err, res){
        //       if(err){
        //         console.log(err);
        //         return raven.captureException(err);
        //       }
        //       console.log(res);
        //     });
        //     return message.member.removeRole(discordRole.id);
        //   }else{
        //     return message.channel.send("<@" + message.author.id + ">", {embed:{
        //       color: 15158332,
        //       fields: [{
        //         name: "Error",
        //         value: "I could not find an existing link for you. Make sure you are already verified! If not, please run the command **-link [playerName]**"
        //       },
        //     ],
        //     }});
        //     return undefined;
        //   };
        // });

      });
    });
  });
}

module.exports.config = {
  name: "unlink",
  aliases: ["unverify"]
}
