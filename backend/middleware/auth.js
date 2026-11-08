const jwt=require('jsonwebtoken');
const User=require('../models/User');
function jwtSecret(){const secret=process.env.JWT_SECRET;if(!secret||secret.length<32)throw new Error('JWT_SECRET must contain at least 32 characters.');return secret;}
function readToken(req){const h=req.headers.authorization;if(h&&h.startsWith('Bearer '))return h.slice(7).trim();return req.headers['x-auth-token'];}
const protect=async(req,res,next)=>{try{const token=readToken(req);if(!token)return res.status(401).json({success:false,message:'Authentication required.'});const decoded=jwt.verify(token,jwtSecret(),{algorithms:['HS256']});const user=await User.findById(decoded.id).select('-password');if(!user)return res.status(401).json({success:false,message:'Invalid session.'});req.user=user;return next();}catch(e){return res.status(401).json({success:false,message:'Invalid or expired token.'});}};
const restrictTo=(...roles)=>(req,res,next)=>{if(!req.user||!roles.includes(req.user.role))return res.status(403).json({success:false,message:'Insufficient permissions.'});return next();};
const optionalAuth=async(req,res,next)=>{try{const token=readToken(req);if(token){const decoded=jwt.verify(token,jwtSecret(),{algorithms:['HS256']});req.user=await User.findById(decoded.id).select('-password');}}catch(_){req.user=undefined;}return next();};
module.exports={protect,restrictTo,optionalAuth,jwtSecret};
