const config = require("./botconfig.json");
//const webMod = require("./webmod.js");
const Discord = require("discord.js");
const fs = require("fs");
const http = require("http");
const raven = require("raven");
const rethink = require("rethinkdb");
const DBL = require("dblapi.js");

const bot = new Discord.Client({disableEveryone: true});
const dbl = new DBL(config.dblToken);
bot.commands = new Discord.Collection();
bot.cooldown = new Discord.Collection();

raven.config('').install();

http.createServer(function(req, res) {
  //webMod.run(req, res);
  console.log("hi");
}).listen(process.env.PORT || 80);

// rethink.connect({ host: 'localhost', port: 28015 }, function(err, conn) {
//   if(err) throw err;
//   // rethink.dbDrop("account_links").run(conn, function(err, res){
//   //   if(err) throw err;
//   //   console.log(res);
//   // });
//   // rethink.dbCreate("settings").run(conn, function(err, res) {
//   //   if(err) throw err;
//   //   console.log(res);
//   // })
//   // rethink.db("settings").tableCreate("group_settings").run(conn, function(err, res) {
//   //   if(err) throw err;
//   //   console.log(res);
//   // });
//   // rethink.db("settings").tableCreate("roleBindings_settings").run(conn, function(err, res) {
//   //   if(err) throw err;
//   //   console.log(res);
//   // });
//   // rethink.db("settings").tableCreate("public_roles").run(conn, function(err, res){
//   //   if(err) throw err;
//   //   console.log(res);
//   // });
// });

function loadCode(){
  fs.readdir("./commands/", (err, files) => {
    if(err) console.log(err);
    let jsFile = files.filter(f => f.split(".").pop() === "js")

    if (jsFile.length <= 0){
      console.log("Couldn't find commands");
      return;
    };
    jsFile.forEach((f, i) =>{
      delete require.cache[require.resolve(`./commands/${f}`)];
      var cmds = require(`./commands/${f}`);
      console.log(`${f} loaded!`);
      bot.commands.set(cmds.config.name, cmds);
    });
  });
};

function clean(text){
  if(typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
    return text;
};

function userHasPermission(message){
  if(message.member.hasPermission("ADMINISTRATOR")) return true;
};

async function autoVerify(member){
  function getData(tbl){
    return tbl.authorID === member.id;
  };
  let verifiedRole = member.guild.roles.find("name", "Verified");
  if(!verifiedRole){
    newRole = await member.guild.createRole({
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
      cursor.toArray(function(err, result){
        if(err){
          console.log(err);
          return raven.captureException(err);
        };
        const dataResult = result.find(getData)
        if(dataResult){
          console.log(true);
          member.addRole(verifiedRole || newRole);
          return member.send({embed:{
            color: 15844367,
            fields: [{
              name: "Success",
              value: `You have been verified in the Discord, \`${member.guild.name}\` \n\n Thank you for verifying with Modulus! (:`
            },
          ],
          }});
        };
      });
    });
  });
};

function find(myArray, roleKey){
  for(var i = 0; i < myArray.length; i++){
    if(myArray[i].role == roleKey){
      return myArray[i];
    };
  };
};

async function deleteBind(role){
  function getData(tbl){
    return tbl.guildID === role.guild.id;
  };
  let guild = role.guild.id;
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
        const dataResult = result.find(getData)
        if(dataResult){
          console.log(role);
          let bindInfo = dataResult.binds;
          let roleResult = find(bindInfo, role.name);
          console.log(roleResult);
          if(roleResult){
            console.log(true, roleResult);
            let removeIndex = dataResult.binds.map(function(item) {return item.role;}).indexOf(role.name);
            dataResult.binds.splice(removeIndex, 1);
            rethink.db("settings").table("roleBindings_settings").get(dataResult.id).update({guildID: role.guild.id, binds: dataResult.binds}).run(conn, function(err, res){
              if(err){
                console.log(err);
                return raven.captureException(err);
              };
              bindInfo = [];
              return
            });
          };
        };
      });
    });
  });
};

loadCode();

bot.on("ready", async () => {
  console.log(`${bot.user.username} is online on ${bot.guilds.size} servers!`);
  await bot.user.setActivity(`${bot.guilds.size} servers | ${config.prefix}help`, {type: 'WATCHING'});
  //bot.user.setStatus("idle");
  // setInterval(() => {
  //   dbl.postStats(bot.guilds.size);
  // }, 1800000);
});

dbl.on("posted", () => {
  console.log('Server count posted!');
});

bot.on("error", async error => {
  console.log(error);
  raven.captureException(error);
});

dbl.on("error", err => {
 console.log(err);
 raven.captureException(err);
});

bot.on("guildMemberAdd", async member => {
  autoVerify(member);
});

bot.on("guildCreate", async guild => {
  let settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
  console.log(`${bot.user.username} joined server, name: ${guild.name} id: ${guild.id}`);
  bot.user.setActivity(`for ${bot.guilds.size} servers | ${config.prefix}help`);
  // setInterval(() => {
  //   dbl.postStats(bot.guilds.size);
  // }, 1800000);
});

bot.on("guildDelete", async guild => {
  console.log(`${bot.user.username} left server, name: ${guild.name} id: ${guild.id}`);
  bot.user.setActivity(`for ${bot.guilds.size} servers | ${config.prefix}help`);
  // setInterval(() => {
  //   dbl.postStats(bot.guilds.size);
  // }, 1800000);
});

bot.on("roleDelete", async role => {
  deleteBind(role);
});

bot.on("unhandledRejection", async err => {
  console.error("Uncaught Promise Rejection: \n", err);
})

bot.on("message", async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  if(message.content === "hey modulus"){
    return message.channel.send("Yes, sir?");
  };

  if(message.content === "lets start deving, ok?"){
    return message.channel.send("Yes sir, after you.");
  };

  let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));
  let settingsFile = require("./commands/settings.js");

  if(!prefixes[message.guild.id]){
    prefixes[message.guild.id] = {
      prefixes: config.prefix
    };
  };

  let prefixMention = new RegExp(`^<@!?${bot.user.id}>`);
  let prefix = prefixes[message.guild.id].prefixes;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  if(!message.content.startsWith(prefix)) return;

  if(!bot.cooldown.has(cmd)) {
    bot.cooldown.set(cmd, new Discord.Collection());
  };

  const now = Date.now();
  const timestamps = bot.cooldown.get(cmd);
  const cooldownAmount = 5000;

  if(!timestamps.has(message.author.id)) {
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  }
  else{
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    if (now < expirationTime){
        const timeLeft = (expirationTime - now) / 1000;
        return message.channel.send("<@" + message.author.id + ">", {embed:{
          color: 15158332,
          fields: [{
            name: "Error",
            value: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${cmd.slice(prefix.length)}\` command`
          },
        ],
        }});
    };
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  };

  let commandFile = bot.commands.get(cmd.slice(prefix.length)) || bot.commands.find(cmnd => cmnd.config.aliases && cmnd.config.aliases.includes(cmd.slice(prefix.length)));
  if(commandFile) commandFile.run(bot, message, args);

  if(cmd === `${prefix}refresh`){
    if (message.author.id !== config.ownerID) return;
    loadCode();
    message.channel.send(":white_check_mark: reloaded commands! :white_check_mark:");
  };

  if(cmd === `${prefix}exec`){
    if(message.author.id !== config.ownerID) return;
    try{
      var code = args.join(" ");
      var evaled = eval(code);

      if(typeof evaled !== "string")
        evaled = require("util").inspect(evaled);
        message.channel.send(clean(evaled), {code:"xl"});
    }catch(err){
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
      raven.captureException(e);
    };
  };

  if(cmd === `${prefix}Group` && userHasPermission(message)){
    console.log(true);
    settingsFile.runType("Group")
  };

});

bot.login(process.argv[2] || config.token);
