const env = require("dotenv").config({path: './config/.env'});
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const app = express();
const ObjectID = require('mongodb').ObjectID;
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const formidable = require('formidable');
const fs = require('fs');
const colors = require('colors');

const session = require('express-session');
app.use(
  session({
    key: "admin",
    secret: "any random String", 
    // proxy: true,
    resave: true,
    saveUninitialized: true 
  })
); 

app.use("/static", express.static(__dirname + "/static"));
// app.use(express.static("public"));
app.set("view engine", "ejs");


      app.use(
        bodyParser.urlencoded({
          extended: true,
        })
      );
      app.use(bodyParser.json());
 
var MongoClient = require('mongodb').MongoClient; 
MongoClient.connect(
  "mongodb://localhost:27017",
//    process.env.DATABASE,
  {useNewUrlParser: true,
  useUnifiedTopology: true
}, function(error, client){
      var blog = client.db('blog');
      console.log('DB Connected !! '.red.bold);

      app.get("/", function (req, res) {
          blog.collection("settings").findOne({}, function(error, settings){
              var postLimit = parseInt(settings.post_limit);
              blog.collection("posts").find().sort({"_id": -1}).limit(postLimit).toArray(function(error, posts){
            //   posts = posts.reverse();
              res.render("user/index", {
              posts: posts,
              "postLimit": postLimit
            });
          });
           });
          
      });

    //    app.get("/blog", function (req, res) {
    //       blog.collection("settings").findOne({}, function(error, settings){
    //           var postLimit = parseInt(settings.post_limit);
    //           blog.collection("posts").find().sort({"_id": -1}).limit(postLimit).toArray(function(error, posts){
    //           posts = posts.reverse();
    //           res.render("user/blog", {
    //           posts: posts,
    //           "postLimit": postLimit
    //         });
    //       });
    //        });
          
    //   });

       app.get("/blog", function (req, res) {
              blog.collection("posts").find().toArray(function(error, posts){
              posts = posts.reverse();
              res.render("user/blog", {
              posts: posts
            });
          });
          
      });


    // app.get('/', function(req, res){
    //       res.render('user/index');
    //   });

      app.get('/gallery', function(req, res){
          res.render('user/gallery');
      });

      app.get('/blog-single', function(req, res){
          res.render('user/blog-single');
      });

    //   app.get('/blog', function(req, res){
    //       res.render('user/blog');
    //   });

      app.get('/contact', function(req, res){
          res.render('user/contact');
      });

      app.get('/about', function(req, res){
          res.render('user/about');
      });
      app.get('/services', function(req, res){ 
          res.render('user/services');
      });

      app.get('/get-posts/:start/:limit', function(req, res){
          blog.collection("posts").find().sort({"_id": -1}).skip(parseInt(req.params.start)).limit(parseInt(req.params.limit)).toArray(function(error, posts){
              res.send(posts);
          });
      });

       app.get('/do-logout', function(req, res){
          req.session.destroy();
          res.redirect("/admin");
      });
       app.get('/admin/dashboard', function (req, res) {
          if(req.session.admin){
          res.render('admin/dashboard');
          } else {
              res.redirect("/admin");
          }
      });
       app.get("/admin/posts", function (req, res) { 
           if (req.session.admin) {
               blog.collection("posts").find().toArray(function(error, posts){

               res.render("admin/posts", {"posts": posts});
               
               });
           } else {
             res.redirect("/admin");
           }
       });
       app.get('/admin/settings', function(req, res){
           blog.collection("settings").findOne({}, function(error, settings){
           res.render('admin/settings', {
               "post_limit": settings.post_limit
           });
           })
       });

       app.post('/admin/save_settings', function(req, res){
           blog.collection("settings").update({}, {
               "post_limit": req.body.post_limit
           }, {upsert: true}, function(error, document){
               res.redirect('/admin/settings');
           });
       });

       app.post('/do-admin-login', function(req, res){
           blog.collection("admins").findOne({"email": req.body.email, "password": req.body.password},
            function(error, admin){
               if(admin != ""){
                   req.session.admin = admin;
               } 
               res.send(admin);
           });
       });

         app.get("/posts/edit/:id", function(req, res){
          if(req.session.admin){
              blog.collection("posts").findOne({
                  "_id": ObjectID(req.params.id)
              }, function(error, post){
                  res.render("admin/edit_post", {"post":post});
              })
               }else{
              res.redirect("/admin");
          }
           
       });
       app.post("/contact", function (req, res) {

    const output = `
  <p>Vous avez un nouveau message</p>
    <h3>Informations Du Contact</h3>
    <ul>
        <li>Prénom : ${req.body.name}</li>
        <li>Email : ${req.body.email}</li>
        <li>Subject : ${req.body.subject}</li>
    </ul>
    <h3>Message:</h3>
    <p>${req.body.message}</p>
  `;
    "use strict";

    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            // host: "smtp.ethereal.email",
            // port: 587,
            // secure: false, // true for 465, false for other ports
            service: "gmail",
            auth: {
                user: process.env.GMAIL_EMAIL, // generated ethereal user
                pass: process.env.GMAIL_PASS // generated ethereal password
            },
            tls: {
                rejectUnauthorized: false
            } 
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: req.body.email, // sender address
            to: process.env.GMAIL_EMAIL, // list of receivers
            subject: "Message Venant Du Site", // Subject line
            text: "Hello World", // plain text body
            html: output, // html body
        });

        console.log("Message sent: %s", info.messageId);

        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        res.render('user/successmes');
    }

    main().catch(console.error);    

});

       app.post("/do-edit-post", function(req, res){
           blog.collection("posts").updateOne({
               "_id": ObjectID(req.body._id)
           }, {
               $set: {
                   "title": req.body.title,
                   "content": req.body.content,
                   "image": req.body.image
               }
           }, function(error, post){
               res.send('Updated Successfully !!');
           });
       });

      

       app.get('/admin', function(req, res){
           res.render('admin/login');
       });

       app.get('/admin/posts/:id', function(req, res){
           blog.collection('posts').findOne({"_id": ObjectID(req.params.id)}, function(error, post){
               res.render('user/blog-single', {post: post});
           });
       });

       app.post('/do-post', function(req, res){
           blog.collection("posts").insertOne(req.body, function(error, document){
               res.send({
                   text: "Posted Successfully !!!",
                   _id: document.insertedId 
               });
           });
       });
       app.post('/do-comment', function(req, res){
           var comment_id = ObjectID();
           blog.collection("posts").updateOne({"_id": ObjectID(req.body.post_id)}, {
               $push: {
                   "comments": {_id: comment_id, username: req.body.username, comment: req.body.comment, email: req.body.email}
               }
           }, function(error, post){
               res.send({
                   text: 'Comment Display Successfully !!!',
                   _id: post.insertedId
               });
           });
       });

       app.post('/do-delete', function(req, res){
           if(req.session.admin){
               fs.unlink(req.body.image.replace("/", ""), function(error){
                   blog.collection("posts").deleteOne({
                       "_id": ObjectID(req.body._id)
                   }, function(error, document){
                       res.send("Deleted");
                   });
               });

           }else{
               res.redirect('/admin');
           }

       });

       app.post('/do-reply', function(req, res){
           var reply_id = ObjectID();
           blog.collection("posts").updateOne(
               {
               "_id": ObjectID(req.body.post_id),
               "comments._id": ObjectID(req.body.comment_id)
           }, {
               $push:{
                   "comments.$.replies":{
                       _id: reply_id,
                       name: req.body.name,
                       reply: req.body.reply
                   }
               }
           }, function(error, document){
               var transporter = nodemailer.createTransport({
                   "service": "gmail",
                   "auth": {
                       "user": "process.env.GMAIL_EMAIL",
                       "pass": "process.env.GMAIL_PASS"
                   } 
               });
               var mailOptions = {
                   "from": "My Blog",
                   "to": req.body.comment_email,
                   "subject" : "New Reply",
                   "text":req.body.name + "has replied to your comment.http://localhost:3000/posts/" + req.body.post_id 
               };
               transporter.sendMail(mailOptions, function(error, info){
                   res.send({
                   text: "Replied Successfully !!!",
                   _id: reply_id
               });
               });
           });
       });

     
       app.post("/do-update-image", function(req, res){
           var formData = new formidable.IncomingForm();
           formData.parse(req, function(error, fields, files){
               fs.unlink(fields.image.replace("/", ""), function(error){
                   var oldPath = files.file.path;
               var newPath = "static/images/" + files.file.name;
               fs.rename(oldPath, newPath, function(err){
                   res.send("/" + newPath);
               });
               });
           });
       });

       app.post('/do-upload-image', function(req, res){
            var formData = new formidable.IncomingForm();
           formData.parse(req, function(error, fields, files){
               var oldPath = files.file.path;
               var newPath = "static/images/" + files.file.name;
               fs.rename(oldPath, newPath, function(err){
                   res.send("/" + newPath);
               });
               
           });


       });

       io.on("connection", function(socket){
           console.log("User Connected Successfully !!!");
           socket.on("new_post", function(formData){
               console.log(formData);
               socket.broadcast.emit("new_post", formData);
           });
           socket.on("new_comment", function(comment){
               io.emit("new_comment", comment);
           });
           socket.on("new_reply", function(reply){
               io.emit("new_reply", reply);
           });
           socket.on("delete_post", function(replyId){
               socket.broadcast.emit("delete_post", replyId);
           });
       });


      http.listen(3000, function () {
          console.log('Server is running on port 3000'.blue.bold);
      });
      });













