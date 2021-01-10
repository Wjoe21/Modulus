const Discord = require("discord.js");
const rbx = require("roblox-js");
const rethink = require("rethinkdb");

function accessDB(database, cluster){
  return new Promise((resolve, reject) => {
    rethink.connect({host: "localhost", port: 28015}, function(err, conn){
      if(err) console.log(err);
      rethink.db(database).table(cluster).run(conn, function(err, cursor){
        if(err) console.log(err);
        resolve(cursor);
      });
    });
  })
}

function addLink(author, verifCode, username, userID){
  return new Promise((resolve, reject) => {
    rethink.connect({host: "localhost", port: 28015}, function(err, conn){
      if(err) console.log(err);
      rethink.db("account_links").table("links").run(conn, function(err, cursor){
        if(err) console.log(err);
        rethink.db("account_links").table("links").insert({authorID: author, verificationCode: verifCode, playerName: username, playerUserID: userID}).run(conn, function(err, res){
          if(err) console.log(err);
          resolve(res);
        });
      });
    });
  })
}

async function getLink(userID){
  function getData(tbl){
    return tbl.authorID === userID;
  };
  let linkDB = await accessDB("account_links", "links");
  linkDB.toArray(function(err, result){
    if(err) console.log(err);
    const dataResult = result.find(getData);
    if(dataResult){
      return true;
    }else {
      return false;
    }
  })
}

module.exports = {
  getLink, addLink
}
