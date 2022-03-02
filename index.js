const express=require('express');
const path=require('path')
const session=require('express-session')
const mysql=require('mysql2');
const { resolve } = require('path/posix');
const app=express()
const PORT=process.env.PORT || 7001
let query;
const conn=mysql.createConnection({
  host:"localhost",
  user:"root",
  password:"",
  database:"tweeter_group2"
})

function queryexecutor(query)
{
  return new Promise((resolve,reject)=>{
    conn.query(query,(err,result)=>{
      return resolve(result);
    })
  })
}

app.use(express.urlencoded({extended:true}));
app.use(express.json())
app.use(express.static(path.join(__dirname,"/public")))
app.set("view engine","ejs")
app.set("views",path.join(__dirname,"src/views"));
app.use(session({
  secret:"batch2tweeter",
  resave : true,
  saveUninitialized:true
}))
app.listen(PORT,()=>{
  console.log(`server is up on ${PORT}`)
})


app.get('/setsession',(req,res)=>{
 req.session.name="nirav";
 res.send("session set")
})
app.get('/getsession',(req,res)=>{
  console.log("session which was set earlier is",req.session.name)
})

app.post('/like',async(req,res)=>{
  let data=req.body;
  console.log("entered into the like routes with tweet_id=",data.tweet_id)
  query="select count(*) as like1 from likes where source_uid='1' and tweet_id="+data.tweet_id+"";
  console.log("select query=",query)
  count=await queryexecutor(query);
  console.log("already like count=",count[0].like1)
  if(count[0].like1>=1)
  {
    let id="already"
    let data={id:id}
    return res.send({data})
  }
  else{
  query="insert into likes(source_uid,tweet_id,likes) values(1,"+data.tweet_id+",1)";
  console.log("likes query=",query)
  likes=await queryexecutor(query)
  let id="kasdjf"
   data={id:id}
  return res.send({data})
  }
})

app.get('/user',(req,res)=>{
     
})

app.get('/comments',async(req,res)=>{
  console.log("received tweet_id=",req.query.tweet_id)
  query="select (select uname from login where login.uid= comments.source_uid ) as uname,comments,comment_time from comments where tweet_id="+req.query.tweet_id+""
  console.log(query);
  let data=await queryexecutor(query)
  res.send({data});
})

app.post('/comment/add',async(req,res)=>{
  console.log("tweeter id received",req.body.tweet_id)
  console.log("commented message=",req.body.comment)
  query="insert into comments(source_uid,tweet_id,comments,isdeleted) value(1,"+req.body.tweet_id+",'"+req.body.comment+"',0)"
  console.log(query)
  await queryexecutor(query)
  })

app.get('/home',async(req,res)=>{
  query="select destination_uid from follows where source_uid='1'";
  console.log("query to se  lect all followers are",query);
  let followers_id=await queryexecutor(query)
  console.log("length of the followerd",followers_id.length)
  let hometimeline=[];
  for(let i=0;i<followers_id.length;i++)
  {
    for(key in followers_id[i])
    {
    console.log(followers_id[i][key])
     let uname="select uname from login where uid="+followers_id[i][key]+""
     console.log("query=",uname);
     uname1 =await queryexecutor(uname)
     console.log(uname1.length,uname1[0].uname);
     query="select tid,tweet_time,tweet from tweets where uid="+followers_id[i][key]+"";
     tweets=await queryexecutor(query)
     console.log(tweets)
     console.log("all tweets of particular user")
     for(let i=0;i<tweets.length;i++)
     {
        console.log(tweets[i].tid,tweets[i].tweet_time,tweets[i].tweet)
        query="select count(*) as likes from likes where  tweet_id="+tweets[i].tid+"";
        let like= await queryexecutor(query)
        console.log("total likes=",like[0].likes)
        hometimeline.push({uname:uname1[0].uname,tweets:tweets[i].tweet,tweet_time:tweets[i].tweet_time,tweet_id:tweets[i].tid,likes:like[0].likes})
     }
    }
  }
     console.log("all the hometimeline data=",hometimeline)
  res.render('hometimeline',{hometimeline});
})


   

app.get('/tweeter',(req,res)=>{
  res.render('login')
})