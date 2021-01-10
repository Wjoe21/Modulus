const Discord = require("discord.js");
const rbx = require("roblox-js");
const rethink = require("rethinkdb");
const snekfetch = require("snekfetch");
const database = require("../util/db.js");

let cachedUsers = [];

function getCode(){
  let verificationCombos = ["avocado", "orange", "gorilla", "purple", "moon", "apple", "pineapple", "fish", "dog", "cat", "grapes", "red", "yellow", "green", "aardvark", "giraffe", "deer", "moon", "sun",
        "grey", "black", "run", "walk", "slow"];
  let arr = [
    verificationCombos[Math.floor(Math.random() * verificationCombos.length)],
    verificationCombos[Math.floor(Math.random() * verificationCombos.length)],
    verificationCombos[Math.floor(Math.random() * verificationCombos.length)],
    verificationCombos[Math.floor(Math.random() * verificationCombos.length)],
    verificationCombos[Math.floor(Math.random() * verificationCombos.length)]
  ];
  let verifCode = arr.join(" ");
  return verifCode;
};

async function changeNickname(message){
  let rank = await rbx.getRankNameInGroup(4484399, cachedUsers[message.author.id]);
  message.guild.members.get(message.author.id).setNickname(rank);
  cachedUsers[message.author.id] = (cachedUsers[message.author.id] + " | " + rank);
}

async function verify(message, username){
  let userID = await rbx.getIdFromUsername(username);
  if(userID){
    let verifCode = getCode();
    let msg = await message.channel.send("<@" + message.author.id + ">",{embed:{
      title: "Success",
      color: 15844367,
      fields: [
      {
        name: "Information",
        value: `You will be verifying, \`${username}\`, user ID: \`${userID}\`. Please place the following code below inside your **status** or **blurb** of your Roblox profile, make sure either is **COMPLETELY EMPTY** and only contains your verification code. Once you have completed this, run the command **-done**.`
      },
      {
        name: "Verification Code",
        value: `Your verification code for \`${username}\` is \`${verifCode}\``
      },
      {
        name: "Timeout",
        value: "This verification attempt will time out in **3 minutes**. Ensure you have linked your account prior to the timeout occuring by placing the verification code in your **status** or **blurb** and running the command **-done**"
      }
    ],
    }});
    let location = message.channel;
    let timeCollectionThing = {maxMatches: 1, time: 180000, errors: ['time']};
    let collected = await location.awaitMessages(response => message.author === response.author && response.content === '-done', timeCollectionThing).catch(() => null);
    if(collected){
      console.log("yes")
      let status = await rbx.getStatus(userID);
      let blurb = await rbx.getBlurb(userID);
      if(status == verifCode || blurb == verifCode){
        console.log("wot")
        let discordRole = message.guild.roles.find("name", "Verified");
        let addLink = await database.addLink(message.author.id, verifCode, username, userID);
        let nickname = await changeNickname(message);
        message.member.addRole(discordRole);
        return message.channel.send("<@" + message.author.id + ">", {embed:{
          color: 15844367,
          fields: [{
            name: "Success",
            value: `You have successfully linked your account \`${username}\` with user ID \`${userID}\` Successfully changed your nickname to, \`${cachedUsers[message.author.id]}\` \n\n Thank you for verifying with Modulus!`
          },
        ],
        }});
      }
    }else {
      return message.channel.send("<@" + message.author.id + ">", {embed:{
        color: 15158332,
        fields: [{
          name: "Error",
          value: "Verification prompt timed out"
        },
      ],
      }});
    }
  }
}

module.exports.run = async(bot, message, args) => {
  let userHasLink = await database.getLink(message.author.id);
  if(userHasLink){
    console.log(false);
    return message.channel.send("<@" + message.author.id + ">", {embed:{
        color: 15158332,
        fields: [{
          name: "Error",
          value: "You already have a verified account!"
        },
      ],
    }});
  }else{
    console.log(true);
    verify(message, args[0]);
    cachedUsers[message.author.id] = args[0];
  }
}

module.exports.config = {
  name: "link",
  aliases: ["verify", "linkaccount"]
}




























// const Discord = require("discord.js");
// const rbx = require("roblox-js");
// const fs = require("fs");
// const raven = require("raven");
// const rethink = require("rethinkdb");
// const snekfetch = require("snekfetch");
//
// var nickname;
//
// async function changeNickname(message, groupID, nickType, playerName, playerID){
//   const rank = await rbx.getRankNameInGroup(groupID, playerID);
//   switch(nickType){
//     case "Standard":
//       console.log("standard");
//       nickname = (playerName + " | " + rank);
//       message.guild.members.get(message.author.id).setNickname(playerName + " | " + rank);
//       //return nickname;
//       break;
//     case "Reverse":
//       console.log("reverse");
//       nickname = (rank + " | " + playerName);
//       message.guild.members.get(message.author.id).setNickname(rank + " | " + playerName);
//     //  return nickname;
//       break;
//     case "RobloxInfo":
//       console.log("roblox info");
//       nickname = (playerName + " | " + playerID);
//       message.guild.members.get(message.author.id).setNickname(playerName + " | " + playerID);
//       //return nickname;
//       break;
//     case "RobloxName":
//       console.log("roblox name");
//       nickname = (playerName);
//       message.guild.members.get(message.author.id).setNickname(playerName);
//       //return nickname;
//       break;
//     case "DiscordName":
//       console.log("discord name");
//       nickname = (message.author.username);
//       message.guild.members.get(message.author.id).setNickname(message.author.username);
//       //return nickname;
//       break;
//   };
// };
//
// async function connectSettingsDb(message, playerName, playerID){
//   function getData(tbl){
//     return tbl.guildID === message.guild.id
//   };
//   rethink.connect({host: "localhost", port: 28015}, function(err, conn){
//     if(err){
//       console.log(err);
//       return raven.captureException(err);
//     };
//     rethink.db("settings").table("group_settings").run(conn, function(err, cursor){
//       if(err){
//         console.log(err);
//         return raven.captureException(err);
//       };
//       cursor.toArray(function(err, result){
//         if(err){
//           console.log(err);
//           return raven.captureException(err);
//         };
//         let dataResult = result.find(getData);
//         if(dataResult){
//           const nickType = dataResult.nicknameTemplate;
//           const groupID = dataResult.groupID;
//           changeNickname(message, groupID, nickType, playerName, playerID);
//         };
//       });
//     });
//   });
// };
//
// async function verify(message, username){
//   const userID = await rbx.getIdFromUsername(username);
//   if(userID){
//     console.log("exists");
//     try{
//       var verificationCombos = ["avocado", "orange", "gorilla", "purple", "moon", "apple", "pineapple", "fish", "dog", "cat", "grapes", "red", "yellow", "green", "aardvark", "giraffe", "deer", "moon", "sun",
//       "grey", "black", "run", "walk", "slow"];
//       const arr = [
//         verificationCombos[Math.floor(Math.random() * verificationCombos.length)],
//         verificationCombos[Math.floor(Math.random() * verificationCombos.length)],
//         verificationCombos[Math.floor(Math.random() * verificationCombos.length)],
//         verificationCombos[Math.floor(Math.random() * verificationCombos.length)],
//         verificationCombos[Math.floor(Math.random() * verificationCombos.length)]
//       ];
//       const verifCode = arr.join(" ");
//       const msg = await message.channel.send("<@" + message.author.id + ">",{embed:{
//         title: "Success",
//         color: 15844367,
//         fields: [
//         {
//           name: "Information",
//           value: `You will be verifying, \`${username}\`, user ID: \`${userID}\`. Please place the following code below inside your **status** or **blurb** of your Roblox profile, make sure either is **COMPLETELY EMPTY** and only contains your verification code. Once you have completed this, run the command **-done**.`
//         },
//         {
//           name: "Verification Code",
//           value: `Your verification code for \`${username}\` is \`${verifCode}\``
//         },
//         {
//           name: "Timeout",
//           value: "This verification attempt will time out in **3 minutes**. Ensure you have linked your account prior to the timeout occuring by placing the verification code in your **status** or **blurb** and running the command **-done**"
//         }
//       ],
//       }});
//       const location = message.channel;
//       const timeCollectionThing = {maxMatches: 1, time: 180000, errors: ['time']};
//       const collected = await location.awaitMessages(response => message.author === response.author && response.content === '-done', timeCollectionThing).catch(() => null);
//       if(collected){
//         const status = await rbx.getStatus(userID);
//         const blurb = await rbx.getBlurb(userID);
//         if(status === verifCode || blurb === verifCode){
//           console.log(true);
//           let discordRole = message.guild.roles.find("name", "Verified");
//           if(!discordRole){
//             newRole = await message.guild.createRole({
//               name: "Verified"
//             });
//           };
//           rethink.connect({host: "localhost", port: 28015}, function(err, conn){
//             if(err){
//               console.log(err);
//               return raven.captureException(err);
//             };
//             rethink.db("account_links").table("links").run(conn, function(err, cursor){
//               if(err){
//                 console.log(err);
//                 return raven.captureException(err);
//               };
//               rethink.db("account_links").table("links").insert({authorID: message.author.id, verificationCode: verifCode, playerName: username, playerUserID: userID}).run(conn, function(err, res){
//                 if(err){
//                   return console.log(err);
//                 };
//                 console.log(res);
//               });
//             });
//           });
//           connectSettingsDb(message, username, userID)
//           message.member.addRole(discordRole || newRole);
//           message.channel.send("<@" + message.author.id + ">", {embed:{
//             color: 15844367,
//             fields: [{
//               name: "Success",
//               value: `You have successfully linked your account \`${username}\` with user ID \`${userID}\` Successfully changed your nickname to, \`${nickname}\` (**THIS FEATURE CURRENTLY DOES NOT DISPLAY YOUR WHAT YOUR NEW NICKNAME WILL BE CORRECTLY, BUT IT DOES CHANGE YOUR NICKNAME CORRECTLY**) \n\n Thank you for verifying with Modulus!`
//             },
//           ],
//           }});
//         }else{
//           return message.channel.send("<@" + message.author.id + ">", {embed:{
//             color: 15158332,
//             url: "https://discord.gg/KeVsm2x",
//             fields: [{
//               name: "Error",
//               value: `I could not find the verification code \`${verifCode}\` for player, \`${username}\`. \n\n Ensure that the verification code is in your **status** or **blurb** of your Roblox profile. Please re-run the command **-link [playerName]** to continue \n\n Your current status and blurb are: \n **Status:** ${status} \n **Blurb:** ${blurb} \n\n If you are still experiencing issues, please join our [support server.](https://discord.gg/KeVsm2x)`
//             },
//           ],
//           }});
//         };
//       }else{
//         console.log(true);
//         return message.channel.send("<@" + message.author.id + ">", {embed:{
//           color: 15158332,
//           fields: [{
//             name: "Error",
//             value: "Verification prompt timed out"
//           },
//         ],
//         }});
//       };
//     }catch(e){
//       console.log(e);
//       raven.captureException(e);
//     };
//   };
//   // setTimeout(function() {
//   //   if(!message.member.roles.exists("name", "Verified")){
//   //     console.log(true);
//   //     return message.channel.send("<@" + message.author.id + ">", {embed:{
//   //       color: 15158332,
//   //       fields: [{
//   //         name: "Error",
//   //         value: "Verification prompt timed out"
//   //       },
//   //     ],
//   //     }});
//   //   };
//   // }, 30000);
// };
//
// module.exports.run = async(bot, message, args) => {
//
//   const {body} = await snekfetch.get("https://api.rprxy.xyz/users/get-by-username?username=" + args[0])
//
//   function getData(tbl){
//     return tbl.authorID === message.author.id;
//   };
//
//   // if(message.member.roles.exists("name", "Verified")){
//   //   return message.channel.send("<@" + message.author.id + ">", {embed:{
//   //     color: 15158332,
//   //     fields: [{
//   //       name: "Error",
//   //       value: "You already have a verified account!"
//   //     },
//   //   ],
//   //   }});
//   // };
//
//   if(!args[0]){
//     return message.channel.send("<@" + message.author.id + ">", {embed:{
//       color: 15158332,
//       fields: [{
//         name: "Error",
//         value: "Please specify a player name, the format should be **-link [playerName]**"
//       },
//     ],
//     }});
//   };
//
//   // if(codes[message.author.id]){
//   //   return message.channel.send("<@" + message.author.id + ">", {embed:{
//   //     color: 15158332,
//   //     fields: [{
//   //       name: "Error",
//   //       value: `You already have a verification attempt in process. Your verification code is \`${codes[message.author.id].verificationCode}\``
//   //     },
//   //   ],
//   //   }});
//   // };
//
//   if(body.errorMessage === "User not found"){
//     return message.channel.send("<@" + message.author.id + ">", {embed:{
//       color: 15158332,
//       fields: [{
//         name: "Error",
//         value: `I could not find any user by the name of \`${args[0]}\` \n\n Please make sure you input a **valid** username`
//       },
//     ],
//     }});
//   };
//
//   rethink.connect({host: "localhost", port: 28015}, function(err, conn){
//     if(err){
//       console.log(err);
//       return raven.captureException(err);
//     };
//     rethink.db("account_links").table("links").run(conn, function(err, cursor){
//       if(err){
//         console.log(err);
//         return raven.captureException(err);
//       };
//       cursor.toArray(function(err, result){
//         if(err){
//           console.log(err);
//           return raven.captureException(err);
//         };
//         const dataResult = result.find(getData)
//         if(dataResult){
//           return message.channel.send("<@" + message.author.id + ">", {embed:{
//             color: 15158332,
//             fields: [{
//               name: "Error",
//               value: `You have already verified an account. The verified user name is \`${dataResult.playerName}\`, and the user ID is \`${dataResult.playerUserID}\`. Please run **-getroles** to continue`
//             },
//           ],
//           }});
//         }else{
//           verify(message, args[0]);
//           return undefined;
//         };
//         // result.forEach(async(data) => {
//         //
//         //   console.log(data);
//         //
//         //   if(data.authorID == message.author.id || message.member.roles.exists("name", "Verified")){
//         //     console.log(true);
//         //     return message.channel.send("<@" + message.author.id + ">", {embed:{
//         //       color: 15158332,
//         //       fields: [{
//         //         name: "Error",
//         //         value: `You have already verified an account. The verified user name is \`${data.playerName}\`, and the user ID is \`${data.playerUserID}\`. Please run **-getroles** to continue`
//         //       },
//         //     ],
//         //     }});
//         //   }else {
//         //     verify(message, args[0]);
//         //     return undefined;
//         //   }
//         // });
//
//       });
//     });
//   });
//
//   //return verify(message, args[0]);
//
// };
//
// module.exports.config = {
//   name: "link",
//   aliases: ["verify", "linkaccount"]
// }
