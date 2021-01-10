const Discord = require("discord.js");
const rbx = require("roblox-js");
const bloxy  = require("bloxy");
const blxy = new bloxy();
const raven = require("raven");
const rethink = require("rethinkdb");
const snekfetch = require("snekfetch");

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

async function getRoles(message, user, playerID, data){
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
    let group = await blxy.getGroup(info.groupID);
    let isInGroup = await group.isInGroup(playerID);
    if(isInGroup === true){
      let groupRank = await rbx.getRankInGroup(info.groupID, playerID);
      let resultObj = find(data.binds, info.groupID);
      let resultObject = search(data.binds, info.groupID, groupRank);
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
    };
  };
  if(rolesGave.length === 0){
    console.log("nothing there");
    return message.channel.send("<@" + message.author.id + ">", {embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: `There are no roles to give to ${user}`
    }],
    }});
  }else{
    const m = await message.channel.send("Sending...");
    m.edit("<@" + message.author.id + ">", {embed:{
      color: 15844367,
      fields: [{
          name: "Success",
          value: `Successfully given the following roles to ${user}: \n **-** ${rolesGave.join('\n **- **')}`
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
          value: `There are no roles to give to ${user}`
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

async function connectToDb(message, user, playerID){
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
          return getRoles(message, user, playerID, dataResult);
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

  let user = message.guild.member(message.mentions.members.first() || message.guild.members.get(args[0]));

  if(!message.member.hasPermission("ADMINISTRATOR")){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "You must have the **ADMINISTRATOR** permission to use this command"
      },
    ],
    }});
  };

  if(!args[0]){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: "Please mention a valid member to **update**"
      },
    ],
    }});
  };

  if(!user){
    return message.channel.send({embed:{
      color: 15158332,
      fields: [{
        name: "Error",
        value: `I cannot find the user ${message.mentions.members.first()}`
      },
    ],
    }});
  };

  function getData(tbl){
    return tbl.authorID === user.id;
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
        const dataResult = result.find(getData)
        if(dataResult){
          const playerUserID = dataResult.playerUserID;
          return connectToDb(message, user, playerUserID);
        }else{
          return message.channel.send({embed:{
            color: 15158332,
            fields: [{
              name: "Error",
              value: `${message.mentions.members.first()} does not have a verified account!`
            },
          ],
          }});
        };
      });
    });
  });

};

module.exports.config = {
  name: "updateroles",
  aliases: ["updaterole"]
}
