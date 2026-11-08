const mongoose=require('mongoose');
const comment=new mongoose.Schema({author:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},content:{type:String,required:true,maxlength:500}},{timestamps:true});
const schema=new mongoose.Schema({author:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},type:{type:String,enum:['update','event','lost','issue'],default:'update'},content:{type:String,required:true,trim:true,maxlength:280},likes:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],comments:[comment],isActive:{type:Boolean,default:true},isPinned:{type:Boolean,default:false}},{timestamps:true,toJSON:{virtuals:true}});
schema.virtual('likeCount').get(function(){return this.likes.length;});
schema.virtual('commentCount').get(function(){return this.comments.length;});
module.exports=mongoose.model('Post',schema);
