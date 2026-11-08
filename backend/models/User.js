const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const schema = new mongoose.Schema({
 name:{type:String,required:true,trim:true,minlength:2,maxlength:60},
 email:{type:String,required:true,unique:true,lowercase:true,trim:true,match:/^[^\s@]+@vitap\.ac\.in$/},
 password:{type:String,required:true,minlength:8,select:false},
 registrationNumber:{type:String,trim:true,uppercase:true}, branch:{type:String,trim:true},
 role:{type:String,enum:['student','admin','moderator'],default:'student'},
 isVerified:{type:Boolean,default:false},avatar:{type:String,default:''},
 bio:{type:String,maxlength:200,default:''},postCount:{type:Number,default:0},lastSeen:{type:Date,default:Date.now}
},{timestamps:true,toJSON:{virtuals:true}});
schema.pre('save',async function(){if(this.isModified('password'))this.password=await bcrypt.hash(this.password,await bcrypt.genSalt(12));});
schema.methods.comparePassword=function(value){return bcrypt.compare(value,this.password);};
schema.virtual('publicProfile').get(function(){return {id:this._id,name:this.name,email:this.email,branch:this.branch,role:this.role,postCount:this.postCount,createdAt:this.createdAt};});
module.exports=mongoose.model('User',schema);
