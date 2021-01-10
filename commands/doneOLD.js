const Discord = require("discord.js");
const rbx = require("roblox-js");
const fs = require("fs");
const raven = require("raven");
const rethink = require("rethinkdb");

var nickname;

function changeNickname(message, nickType, playerName, playerID, playerRank){
  switch(nickType){
    case "Standard":
      console.log("standard");
      message.guild.members.get(message.author.id).setNickname(playerName + " | " + playerRank);
      nickname = (playerName + " | " + playerRank);
      break;
    case "Reverse":
      console.log("reverse");
      message.guild.members.get(message.author.id).setNickname(playerRank + " | " + playerName);
      nickname = (playerRank + " | " + playerName);
      break;
    case "RobloxInfo":
      console.log("roblox info");
      message.guild.members.get(message.author.id).setNickname(playerName + " | " + playerID);
      nickname = (playerName + " | " + playerID);
      break;
    case "RobloxName":
      console.log("roblox name");
      message.guild.members.get(message.author.id).setNickname(playerName);
      nickname = (playerName);
      break;
    case "DiscordName":
      console.log("discord name");
      message.guild.members.get(message.author.id).setNickname(message.author.username);
      nickname = (message.author.username);
      break;
  };
};

async function verifyLinking(message){

  const codes = JSON.parse(fs.readFileSync("./codes.json", "utf8"));
  const settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));

  const status = await rbx.getStatus(codes[message.author.id].playerUserID);
  const blurb = await rbx.getBlurb(codes[message.author.id].playerUserID);
  const rank = await rbx.getRankNameInGroup(settings[message.guild.id].groupID, codes[message.author.id].playerUserID);

  let discordRole = message.guild.roles.find("name", "Verified");
  if(!discordRole){
    newRole = await message.guild.createRole({
      name: "Verified"
    });
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
      if(blurb == codes[message.author.id].verificationCode || status == codes[message.author.id].verificationCode){
        console.log("yes this is true, status and or blurb code is same");
        rethink.db("account_links").table("links").insert({authorID: message.author.id, verificationCode: codes[message.author.id].verificationCode, playerName: codes[message.author.id].playerName, playerUserID: codes[message.author.id].playerUserID}).run(conn, function(err, res){
          if(err){
            return console.log(err);
          };
          console.log(res);
        });
        /*db[message.author.id] = {
          verificationCode: codes[message.author.id].verificationCode,
          playerName: codes[message.author.id].playerName,
          playerUserID: codes[message.author.id].playerUserID,
        }*/
        /*fs.writeFile("./db.json", JSON.stringify(db), (err) => {
          if(err) raven.captureException(err);
        });*/
        changeNickname(message, settings[message.guild.id].nicknameTemplate, codes[message.author.id].playerName, codes[message.author.id].playerUserID, rank)
        message.member.addRole(discordRole || newRole);
        message.channel.send("<@" + message.author.id + ">", {embed:{
          color: 15844367,
          fields: [{
            name: "Success",
            value: `You have successfully linked your account \`${codes[message.author.id].playerName}\` with user ID \`${codes[message.author.id].playerUserID}\` Successfully changed your nickname to, \`${nickname}\` \n\n Thank you for verifying with Modulus!`
          },
        ],
        }});
        codes[message.author.id] = null;
        console.log("done");
        fs.writeFile("./codes.json", JSON.stringify(codes, null, 2), (err) => {
          if(err) return raven.captureException(err);
        });
        console.log("written done file")
        return;
      }else{
        return message.channel.send("<@" + message.author.id + ">", {embed:{
          color: 15158332,
          url: "https://discord.gg/KeVsm2x",
          fields: [{
            name: "Error",
            value: `I could not find the verification code \`${codes[message.author.id].verificationCode}\` for player, \`${codes[message.author.id].playerName}\`. \n\n Ensure that the verification code is in your **status** or **blurb** of your Roblox profile. If it is, re-run the command **-done** \n\n If you are still experiencing issues, please join our [support server.](https://discord.gg/KeVsm2x)`
          },
        ],
        }});
      };

    });
  });

};

module.exports.run = async(bot, message, args) => {

  //rethink.connect({host: "localhost", port: 28015}, function(err, conn){

    let codes = JSON.parse(fs.readFileSync("./codes.json", "utf8"));

    if(message.member.roles.exists("name", "Verified")){
      return message.channel.send("<@" + message.author.id + ">", {embed:{
        color: 15158332,
        fields: [{
          name: "Error",
          value: "You have already verified your account"
        },
      ],
      }});
    };

    if(!codes[message.author.id]){
      return message.channel.send("<@" + message.author.id + ">", {embed:{
        color: 15158332,
        fields: [{
          name: "Error",
          value: "You have not verified your account to run this command. Run the command **-link [playerName]** to try again"
        },
      ],
      }});
    };

    verifyLinking(message);

    // if(codes[message.author.id].verified == true){
    //   return message.channel.send("<@" + message.author.id + ">", {embed:{
    //     color: 15158332,
    //     fields: [{
    //       name: "Error",
    //       value: `Your account ${codes[message.author.id].playerName} has already been **verified**`
    //     },
    //   ],
    //   }});
    // };

  //   rbx.getStatus(codes[message.author.id].playerUserID)
  //   .then(function(status){
  //     if(status == codes[message.author.id].verificationCode){
  //       console.log("yes this is true, status and code is same");
  //       let discordRole = message.guild.roles.find("name", "Verified");
  //       rethink.db("account_links").table("links").insert({authorID: message.author.id, verificationCode: codes[message.author.id].verificationCode, playerName: codes[message.author.id].playerName, playerUserID: codes[message.author.id].playerUserID}).run(conn, function(err, res){
  //         if(err){
  //           return console.log(err);
  //         };
  //         console.log(res);
  //       });
  //       /*db[message.author.id] = {
  //         verificationCode: codes[message.author.id].verificationCode,
  //         playerName: codes[message.author.id].playerName,
  //         playerUserID: codes[message.author.id].playerUserID,
  //       }*/
  //       /*fs.writeFile("./db.json", JSON.stringify(db), (err) => {
  //         if(err) raven.captureException(err);
  //       });*/
  //       message.member.addRole(discordRole.id);
  //       message.channel.send("<@" + message.author.id + ">", {embed:{
  //         color: 15844367,
  //         fields: [{
  //           name: "Success",
  //           value: `You have successfully verified account \`${codes[message.author.id].playerName}\` with user ID \`${codes[message.author.id].playerUserID}\``
  //         },
  //       ],
  //       }});
  //       codes[message.author.id] = null;
  //       fs.writeFile("./codes.json", JSON.stringify(codes), (err) => {
  //         if(err) raven.captureException(err);
  //       });
  //       return undefined;
  //     }else{
  //       return message.channel.send("<@" + message.author.id + ">", {embed:{
  //         color: 15158332,
  //         url: "https://discord.gg/KeVsm2x",
  //         fields: [{
  //           name: "Error",
  //           value: `I could not find the verification code \`${codes[message.author.id].verificationCode}\` for player, \`${codes[message.author.id].playerName}\`. \n\n Ensure that the verification code is in your **status**. If it is, re-run the command **-done** \n\n If you are still experiencing issues, please join our [support server.](https://discord.gg/KeVsm2x)`
  //         },
  //       ],
  //       }});
  //     };
  //   });
  // });

};

module.exports.config = {
  name: "doneOLD",
  aliases: []
}
