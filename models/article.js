const settings = require('../configs/db');

const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = `mongodb://${settings.host}:${settings.port}`;

// Database Name
const dbName = settings.db;

function Post(user, title, post) {
  this.user = user;
  this.title = title;
  this.post = post;
}
module.exports = Post;
//存储用户信息
Post.prototype.save = function (callback) {
  //要存入文档
  var date = new Date();
  //存储各种时间格式，方便以后扩展
  var time = {
    date: date,
    year: date.getFullYear(),
    month: date.getFullYear() + "-" + (date.getMonth() + 1),
    day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
    minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
  }
  //要存入数据库的文档
  var post = {
    user: this.user,
    time: time,
    title: this.title,
    post: this.post
  };
  //打开数据库
  MongoClient.connect(url, function (err, client) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    //读取 articles 集合
    db.collection('article', function (err, collection) {
      if (err) {
        client.close();
        return callback(err); //错误，返回 err 信息
      }
      //将用户数据插入 articles 集合
      collection.insert(post, {
          safe: true
        },
        function (err, article) {
          client.close();
          if (err) {
            return callback(err); //错误，返回 err 信息
          }
          callback(null, article.ops[0]); //成功！err 为 null，并返回存储后的用户文档
        });
    });
    client.close();
  });
};
Post.get = function (name, callback) {
  //打开数据库
  MongoClient.connect(url, function (err, client) {
    // assert.equal(null, err);
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    console.log("Connected successfully to server");
    var query = {};
    if (name) {
      query.name = name;
    }
    //
    const db = client.db(dbName);
    db.collection('article', function (err, collection) {
      if (err) {
        client.close();
        return callback(err); //错误，返回 err 信息
      }
      //查找用户名（name键）值为 name 一个文档
      collection.find(query).sort({
        time: -1
      }).toArray(function (err, articles) {
        client.close();
        if (err) {
          return callback(err); //失败！返回 err 信息
        }
        callback(null, articles); //成功！返回查询的用户信息
      });
    });
  });
};