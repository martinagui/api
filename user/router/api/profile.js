const express = require('express');
const router = express.Router();
const passport = require("passport");
const mongoose = require('mongoose');

const ProfilesSchema = require('../../models/Profiles');
const UserSchema = require('../../models/User');

const validatorProfile = require('../../validation/profile');

const passportUser = passport.authenticate('jwt',{ session: false });

/** 
 * GET api/profile/test
 * 测试当前接口返回的 josn 数据
 * 公用
*/
router.get('/test',(req,res) => {
    res.json({msg:'this is profiles!!'})
});

/** 
 * GET api/profile/
 * 获取当前登录用户的个人信息
 * populate（）可以展示关联的表的数据
*/
router.get("/",passportUser,(req,res) => {
    const errors = {};
    ProfilesSchema.findOne({user: req.user.id})
            .populate('user',["name","avatart"])
            .then((profile) => {
      if(!profile){
        errors.noprofile = "该用户的信息不存在~!";
        return res.status(404).json(errors);
      }
  
      res.json(profile);
    }).catch(err => res.status(404).json(err));
});

/** 
 * GET api/profile/haddle/:handle
 * 根据 handle 获取用户的个人信息
 * populate（）可以展示关联的表的数据
*/
router.get("/handle/:handle",(req,res) => {
    const errors = {};
    ProfilesSchema.findOne({haddle: req.param.haddle})
            .populate('user',["name","avatart"])
            .then(profile => {
      if(!profile){
        errors.noprofile = "该用户的信息不存在~!";
        return res.status(404).json(errors);
      }
  
      res.json(profile);
    }).catch(err => res.status(404).json(err));
});

/** 
 * GET api/profile/user/:user_id
 * 根据 user_id 获取用户的个人信息
 * populate（）可以展示关联的表的数据
*/
router.get("/user/:user_id",(req,res) => {
  const errors = {};
  ProfilesSchema.findOne({user: req.param.user_id})
          .populate('user',["name","avatart"])
          .then(profile => {
    if(!profile){
      errors.noprofile = "该用户的信息不存在~!";
      return res.status(404).json(errors);
    }

    res.json(profile);
  }).catch(err => res.status(404).json(err));
});

/** 
 * GET api/profile/all
 * 获取所有人的个人信息
 * populate（）可以展示关联的表的数据
*/
router.get("/all",(req,res) => {
  const errors = {};
  ProfilesSchema.find()
          .populate('user',["name","avatart"])
          .then(profiles => {
    if(!profiles){
      errors.noprofile = "没有任何用户信息~!";
      return res.status(404).json(errors);
    }

    res.json(profiles);
  }).catch(err => res.status(404).json(err));
});



/** 
 * POST api/profile/
 * 创建和编辑个人信息
*/
router.post("/",passportUser,(req,res) => {
    const {msg,isValid} = validatorProfile(req.body);
  
    // 判断isValid是否通过
    if(!isValid){
      return res.status(400).json(msg);
    }
  
    const profileFields = {};
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.status) profileFields.status = req.body.status;
  
  
    if(req.body.bio) profileFields.bio = req.body.bio;
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;
  
    // skills - 数组转换
    if(typeof req.body.skills !== "undefined"){
      profileFields.skills = req.body.skills.split(",");
    }
  
    profileFields.social = {};
  
    if(req.body.wechat) profileFields.social.wechat = req.body.wechat;
    if(req.body.QQ) profileFields.social.QQ = req.body.QQ;
    if(req.body.tengxunkt) profileFields.social.tengxunkt = req.body.tengxunkt;
    if(req.body.wangyikt) profileFields.social.wangyikt = req.body.wangyikt;
  
    ProfilesSchema.findOne({user: req.user.id}).then(profile => {
      if(profile){
        // 用户信息存在, 执行更新方法
        ProfilesSchema.findOneAndUpdate({user:req.user.id},{$set:profileFields},{new:true}).then(profile => res.json(profile));
      }else{
        // 用户信息不存在, 执行创建方法
        ProfilesSchema.findOne({handle:profileFields.handle}).then(profile => {
          if(profile){
            errors.handle = "该用户的handle个人信息已经存在,请勿重新创建!";
            res.status(400).json(msg);
          }
  
          new ProfilesSchema(profileFields).save().then(profile => res.json(profile));
        })
      }
    })
  });

  /** 
 * POST api/profile/
 * 创建和编辑个人信息
*/

module.exports = router;