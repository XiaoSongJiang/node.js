const settings = require('../configs/db');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = `mongodb://${settings.host}:${settings.port}`;

// Database Name
const dbName = settings.db;

function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
};
module.exports = User;
//存储用户信息
User.prototype.save = function (callback) {
  //要存入数据库的用户文档
  var user = {
    name: this.name,
    password: this.password,
    email: this.email
  };
  //打开数据库
  MongoClient.connect(url, function (err, client) {
    //assert.equal(null, err);
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    //读取 users 集合
    db.collection('users', function (err, collection) {
      if (err) {
        client.close();
        return callback(err); //错误，返回 err 信息
      }
      //将用户数据插入 users 集合
      collection.insert(user, {
        safe: true
      }, function (err, user) {
        client.close();
        if (err) {
          return callback(err); //错误，返回 err 信息
        }
        callback(null, user.ops[0]); //成功！err 为 null，并返回存储后的用户文档
      });
    });
    client.close();
  });
};

//读取用户信息
User.get = function (name, callback) {
  //打开数据库
  MongoClient.connect(url, function (err, client) {
    // assert.equal(null, err);
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    console.log("Connected successfully to server");
    //读取 users 集合
    const db = client.db(dbName);
    db.collection('users', function (err, collection) {
      if (err) {
        client.close();
        return callback(err); //错误，返回 err 信息
      }
      //查找用户名（name键）值为 name 一个文档
      collection.findOne({
        name: name
      }, function (err, user) {
        client.close();
        if (err) {
          return callback(err); //失败！返回 err 信息
        }
        callback(null, user); //成功！返回查询的用户信息
      });
    });
  });
};