const path=require('path'),express=require('express'),mongoose=require('mongoose'),cors=require('cors');
require('dotenv').config({path:path.join(__dirname,'..','.env')});
const app=express(),production=process.env.NODE_ENV==='production';
const origins=(process.env.CLIENT_URL||(production?'':'http://localhost:5000')).split(',').map(x=>x.trim()).filter(Boolean);
if(production&&origins.length===0)throw new Error('CLIENT_URL must be set in production.');
app.use(cors({origin(origin,cb){if(!origin||origins.includes(origin))return cb(null,true);return cb(new Error('Origin not allowed by CORS.'));},credentials:true}));
app.use(express.json({limit:'1mb'}));app.use(express.urlencoded({extended:true,limit:'1mb'}));
app.use('/api/auth',require('./routes/auth'));app.use('/api/posts',require('./routes/posts'));app.use('/api/lost-found',require('./routes/lostFound'));app.use('/api/issues',require('./routes/issues'));
app.get('/api/health',(req,res)=>res.json({status:'ok',database:mongoose.connection.readyState===1?'connected':'disconnected'}));
const root=path.join(__dirname,'..');app.use(express.static(root,{index:false}));app.get('/',(req,res)=>res.sendFile(path.join(root,'web.html')));
app.use((err,req,res,next)=>{if(res.headersSent)return next(err);if(['ValidationError','CastError'].includes(err.name))return res.status(400).json({success:false,message:'Invalid request data.'});console.error(err.message);return res.status(500).json({success:false,message:'Internal server error.'});});
const port=Number(process.env.PORT)||5000;
async function start(){if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw new Error('JWT_SECRET must be configured with at least 32 characters.');if(!process.env.MONGODB_URI)throw new Error('MONGODB_URI is required. Configure it in .env.');await mongoose.connect(process.env.MONGODB_URI);app.listen(port,()=>console.log('CampusConnect listening on port '+port));}
if(require.main===module)start().catch(e=>{console.error('Startup failed:',e.message);process.exit(1);});
module.exports=app;
