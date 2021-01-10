const Discord = require("discord.js");
const rbx = require("roblox-js");
const bloxy  = require("bloxy");
const blxy = new bloxy();
const raven = require("raven");
const rethink = require("rethinkdb");
const snekfetch = require("snekfetch");

// settings[message.guild.id].groupIDs.forEach(async(id) => {
//   console.log(id);
//   const groupRankName = await rbx.getRankNameInGroup(id, playerID);
//   let verifiedRole = message.guild.roles.find("name", "Verified");
//   console.log(groupRankName);
//   if(groupRankName === "Guest"){
//     return message.channel.send("<@" + message.author.id + ">",{embed:{
//       color: 15158332,
//       fields: [{
//         name: "Error",
//         value: "I could not find any roles to give you"
//       },
//     ],
//     }});
//     return;
//   }
//   let discordRole = message.guild.roles.find("name", groupRankName);
//   if(!discordRole){
//     newRole = await message.guild.createRole({
//       name: groupRankName
//     });
//   };
//   if(!message.member.roles.exists("name", "Verified")){
//     await message.member.addRole(verifiedRole);
//   };
//   if(message.member.roles.exists("name", groupRankName)){
//     return message.channel.send("<@" + message.author.id + ">",{embed:{
//       color: 15158332,
//       fields: [{
//         name: "Error",
//         value: `You already have the role \`${groupRankName}\`. If you are to recieve anymore roles, I will be giving you those now`
//       },
//     ],
//     }});
//   };
//   rolesGave.push(groupRankName);
//   await message.member.addRole(discordRole || newRole);
//   // return message.channel.send("<@" + message.author.id + ">", {embed:{
//   //   color: 15844367,
//   //   fields: [{
//   //     name: "Success",
//   //     value: `Successfully given you the role **${groupRankName}**`
//   //   }],
//   // }})
//   // return undefined;
//   return undefined;
// });
// //if(rolesGave.length === 0) return;
// const m = await message.channel.send("Sending...");
// m.edit("<@" + message.author.id + ">", {embed:{
//   color: 15844367,
//   fields: [{
//       name: "Success",
//       value: `Successfully given the following roles: \n **-** ${rolesGave.join('\n **- **')}`
//     }],
// }});
// rolesGave = [];
// return undefined;

function search(myArray, groupKey, rankKey){
  for(var i = 0; i < myArray.length; i++) {
    if(myArray[i].groupID === groupKey && myArray[i].rank == rankKey){
      return myArray[i];
    };
  };
};

function find(myArray, groupKey){
  for(var i = 0; i < myArray.length; i++){
    if(myArray[i].groupID == groupKey && myArray[i].rank === "all"){
      return myArray[i];
    };
  };
};

// function filter(myArray, groupKey){
//   for(var i = 0; i < myArray.length; i++){
//     if(myArray[i].groupID == groupKey){
//       return myArray[i];
//     };
//   };
// };

async function getRoles(message, playerID, data){
  var rolesGave = [];
  var haveRoles = [];
  var removeRoles = [];
  if(data.binds.length === 0){
    return message.channel.send("<@" + message.author.id + ">", {embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "There are currently no binds set for this server"
    }],
    }});
  };
  for(let info of data.binds){
    //console.log("Before", info, data.binds.length, info.groupID);
    let group = await blxy.getGroup(info.groupID);
    let isInGroup = await group.isInGroup(playerID);
    if(isInGroup === true){
      let groupRank = await rbx.getRankInGroup(info.groupID, playerID);
      let resultObj = find(data.binds, info.groupID);
      let resultObject = search(data.binds, info.groupID, groupRank);
      // let resObject = filter(data.binds, info.groupID);
      //console.log(resObject);
      // console.log("All Result", resultObj);
      // console.log("Result", resultObject);
      if(resultObj){
        let discordRole = message.guild.roles.find("name", resultObj.role);
        if(message.member.roles.find("name", discordRole.name)){
          haveRoles.push(discordRole.name);
          await message.member.addRole(discordRole);
        }else{
          if(discordRole){
            rolesGave.push(discordRole.name);
            await message.member.addRole(discordRole);
          };
        };
      };
      if(resultObject){
        let discordRole = message.guild.roles.find("name", resultObject.role);
        if(message.member.roles.find("name", discordRole.name)){
          haveRoles.push(discordRole.name);
          await message.member.addRole(discordRole);
        }else{
          if(discordRole){
            rolesGave.push(discordRole.name);
            await message.member.addRole(discordRole);
          };
        };
      };
      // if(resObject){
      //   if(resObject.rank !== groupRank){
      //     let discordRole = message.guild.roles.find("name", resObject.role);
      //     if(message.member.roles.find("name", discordRole.name)){
      //       removeRoles.push(discordRole.name);
      //       await message.member.removeRole(discordRole);
      //     };
      //   };
      // };
    };
  };
  if(rolesGave.length === 0){
    console.log("nothing there");
    return message.channel.send("<@" + message.author.id + ">", {embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "There are no roles to give to you"
    }],
    }});
  }else{
    const m = await message.channel.send("Sending...");
    m.edit("<@" + message.author.id + ">", {embed:{
      color: 15844367,
      fields: [{
          name: "Success",
          value: `Successfully given the following roles: \n **-** ${rolesGave.join('\n **- **')}`
        }],
    }});
  };
  if(haveRoles.length === 0){
    console.log("nothing there!");
    if(rolesGave.length !== 0){
      return
    }else{
      return message.channel.send("<@" + message.author.id + ">", {embed:{
        color: 15158332,
        fields: [{
          name: "Error",
          value: "There are no roles to give to you"
      }],
      }});
    };
  }else{
    const msg = await message.channel.send("Sending...");
    msg.edit("<@" + message.author.id + ">", {embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: `You already have the role(s): \n **-** ${haveRoles.join('\n **- **')} \n\n If you are to recieve anymore roles, I will be giving you those now`
      },
    ],
    }});
    haveRoles = [];
    rolesGave = [];
  };
};

async function connectToDb(message, playerID){
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
          const binds = Array.from(dataResult.binds)
          dataResult.binds = binds
          console.log("yes there is data when running getroles", dataResult.binds.length);
          return getRoles(message, playerID, dataResult);
        }else{
          return message.channel.send("<@" + message.author.id + ">", {embed:{
            color: 15158332,
            fields: [{
              name: "Error",
              value: "There are currently no binds set for this server"
            }],
          }});
        };
      });
    });
  });
};

module.exports.run = async(bot, message, args) => {

  function getData(tbl){
    return tbl.authorID === message.author.id;
  };

  let verifiedRole = message.guild.roles.find("name", "Verified");

  // if(codes[message.author.id]){
  //   return message.channel.send("<@" + message.author.id + ">",{embed:{
  //     color: 15158332,
  //     fields: [{
  //       name: "Error",
  //       value: "Please finish your existing verification process before attempting to run **-getroles**"
  //     },
  //   ],
  //   }});
  // };

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
        const dataResult = result.find(getData)
        if(dataResult){
          const playerUserID = dataResult.playerUserID;
          if(dataResult.verificationCode === "FORCEFULLY VERIFIED"){
            return message.channel.send("<@" + message.author.id + ">",{embed:{
              color: 15158332,
              fields: [{
                name: "Error",
                value: "You are restricted from running this command because you have been forcefully verified by an administrator. \n\n To properly verify yourself, run the command **-unverify**, and then run the command **-link [playerName]** and follow the on-screen instructions"
              },
            ],
            }});
          };
          return connectToDb(message, playerUserID);
        }else{
          return message.channel.send("<@" + message.author.id + ">", {embed:{
            color: 15158332,
            url: "https://discord.gg/KeVsm2x",
            fields: [{
              name: "Error",
              value: "I could not find an existing account link for you. Please run **-link [playerName]** to run the verification process again \n\n If you are still experiencing issues, please join our [support server.](https://discord.gg/KeVsm2x)"
            },
          ],
          }});
        };
        // result.forEach(async(data) => {
        //   if(data.authorID == message.author.id || message.member.roles.exists("name", "Verified")){
        //     console.log("true, data exists");
        //     console.log(data);
        //     //console.log(data.find(getData));
        //     // var dataArray = Object.keys(data).map(function(key) {
        //     //   return [Number(key), data[key]];
        //     // });
        //     // const result = data.find(objData => objData.authorID === message.author.id);
        //     // console.log(result);
        //     //return getRoles(message, data.playerUserID);
        //   };
        //   //console.log(data);
        // });
      });
    });
  });

};

module.exports.config = {
  name: "getroles",
  aliases: ["getrole"]
}
