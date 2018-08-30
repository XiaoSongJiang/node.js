var express = require('express');
var router = express.Router();

var crypto = require('crypto');
var User = require('../models/users');
var checkLogin = require('../middleware/loginStatusCheck').checkLogin;
var checkNotLogin = require('../middleware/loginStatusCheck').checkNotLogin;
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: '主页',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});
/* 注册 */
router.get('/register', function (req, res, next) {
  res.render('register', {
    title: '注册',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});
router.post('/register', function (req, res, next) {
  try {
    let name = req.body.user_name,
      password = req.body.user_password,
      password_re = req.body.user_confirm_password;
    if (!password) {
      req.flash('error', '请输入密码!');
      return res.redirect('/register'); //返回注册页
    } else if (password_re != password) {
      req.flash('error', '两次输入的密码不一致!');
      return res.redirect('/register'); //返回注册页
    }
    let md5 = crypto.createHash('md5');
    password = md5.update(password).digest('hex');
    var newUser = new User({
      name: name,
      password: password,
      email: req.body.user_email
    });
    User.get(newUser.name, function (err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      if (user) {
        req.flash('error', '用户已存在!');
        return res.redirect('/register'); //返回注册页
      }
      //如果不存在则新增用户
      newUser.save(function (err, user) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/register'); //注册失败返回主册页
        }
        req.session.user = newUser; //用户信息存入 session
        req.flash('success', '注册成功!');
        return res.redirect('/'); //注册成功后返回主页
      });
    });
  } catch (error) {
    console.log("err", error);
    return res.redirect('/')
  }
});
/* 登录 */
router.get('/login', checkNotLogin);
router.get('/login', function (req, res, next) {
  res.render('login', {
    title: '登录',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});
router.post('/login', function (req, res, next) {
  //生成密码的 md5 值
  const md5 = crypto.createHash('md5');
  let { user_password, user_name } = req.body;
  let password = md5.update(user_password).digest('hex');
  //检查用户是否存在
  User.get(user_name, function (err, user) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    if (!user) {
      req.flash('error', '用户不存在!');
      return res.redirect('/login'); //返回注册页
    }
    //如果存在则检测密码
    if (user.password != password) {
      req.flash('error', '密码错误!');
      return res.redirect('/login'); //密码错误则跳转到登录页
    }
    //用户名密码都匹配后，将用户信息存入 session
    req.session.user = user;
    req.flash('success', '登陆成功!');
    res.redirect('/'); //登陆成功后跳转到主页
  });
});
router.get('/logout', checkLogin);
router.get('/logout', function (req, res, next) {
  req.session.user = null;
  req.flash('success', '登出成功!');
  res.redirect('/');
});

module.exports = router;