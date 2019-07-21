var express = require('express')
var path = require('path') 
var app = express()
var session = require('express-session');
var hbs=require('hbs');
var multer   = require('multer');

var fs = require('fs');
var passport=require('passport');



app.use(passport.initialize());
app.use(passport.session());




const nodemailer = require("nodemailer");



//Acces static files
var access=0;
app.use(express.static(path.join(__dirname, 'public')));
//Bodyparser
app.use(express.urlencoded({extended: true})); 
app.use(express.json());
app.use(session({secret: "SecretLogin"}));

const viewsPath = path.join(__dirname, 'template/views');
const partialsPath = path.join(__dirname, 'template/partial');

app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

//Connect with db
var mongoose = require('mongoose');
var mongoDB = 'mongodb://localhost/muskan1';
mongoose.connect(mongoDB);
mongoose.connection.on('error', (err) => {
    console.log('DB connection Error');
});
mongoose.connection.on('connected', (err) => {
    console.log('DB connected');
});
var productSchema = new mongoose.Schema({
    Email :String,
    Name:String,
    DOB :String,
    Gender :String,
    Phone : Number,
    City : String,
    Password : String,
    role:String,
    status:String,
    Flag:Number,
   Joined:[String],
    Created:[String],
     final: { contentType: String,
             image:Buffer,
             path:String }
    //category : [{ 'abd': Number , }]
  })
var user = mongoose.model('users', productSchema);


var communitySchema= new mongoose.Schema({
    cRule :String,
    cName:String,
    cOwner :String,
    cDate :String,
    cStatus:String,
    cDesc:String,
    cOEmail:String,
    cManager:String,
cLocation: String,
  photoname:String,
    member:[String],
    request:[String],
      final: { contentType: String,
             image:Buffer,
             path:String }
    //category : [{ 'abd': Number , }]
  })
var community = mongoose.model('communities',communitySchema);






passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null,user);
});


var GitHubStrategy = require('passport-github').Strategy;
//const passport=require('passport');

passport.use(new GitHubStrategy({
    clientID: '50c9c36f3cdb0a6d288a',
    clientSecret: 'c8570efbd11dd9d1142ec1a40f88ef764a1f23e1',
    callbackURL: "http://localhost:3000/auth/github/callback",
	session : true
  },
  
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
      return cb(null, profile);
    }
                               )
  );
app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/index.html'
  }),
  function (req, res) {
    console.log("githubsignin succesful");
    console.log(req.session.Email);

 product.update({
      "Email": req.session.passport.user._json.Email
    }, {
      "Name": req.session.passport.user._json.Name,
      "Email": req.session.passport.user._json.Email,
      "City": req.session.passport.user._json.City,
      //"visibility": true,
      "status": "Pending",
      "role": "user",
    }, {
      upsert: true
    }
   );
    req.session.islogin = 1;
    req.session.Name = req.session.passport.user._json.Name;
    req.session.Email = req.session.passport.user._json.Email;
	console.log('github login successful')
	console.log(req.session.Name)
	console.log(req.session.Email)
    res.redirect('/admin');
    //res.send('Github login successful');
  });






var product =  mongoose.model('users', productSchema);




// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()+ path.extname(file.originalname));
  }
});
 
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
});

//Acces static files
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

const myurl = 'mongodb://localhost/muskan1';

const MongoClient = require('mongodb').MongoClient;


MongoClient.connect(myurl, (err, client) => {
  if (err) return console.log(err)
  db = client.db('users') 
  
})
 app.post('/uploadphoto', upload.single('myImage'),(req, res) => {
     if(!req.file)
         res.render('editprofile',"Upload A File");
 else{
    var img = fs.readFileSync(req.file.path);
 var encode_image = img.toString('base64');
 // Define a JSONobject for the image attributes for saving to database

  var finalImg = {
      path:req.file.path,
      contentType: req.file.mimetype,
      image:  new Buffer(encode_image, 'base64')
   }
  product.findOneAndUpdate(
      {
      Email:req.session.Email
  },
                           {
                               final:finalImg
                             //  console.log(final);
                           })
    .then(data => {
      console.log(data);
          res.render('editprofile')
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })

 }
  })

app.get('/photos', (req, res) => {
product.findOne({
    Email:req.session.Email
})
       .then(data => {
   // console.log("data"+data.final.path);
       res.contentType('image/jpeg');
          res.send(data.final.path)
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
});

app.post('/cuploadphoto/:name', upload.single('myImage'),(req, res) => {
     if(!req.file)
         res.render('updatecommunity',"Upload A File");
 else{
    var img = fs.readFileSync(req.file.path);
 var encode_image = img.toString('base64');
 // Define a JSONobject for the image attributes for saving to database

  var finalImg = {
      path:req.file.path,
      contentType: req.file.mimetype,
      image:  new Buffer(encode_image, 'base64')
   }
  community.findOneAndUpdate(
      {
      cName:req.params.name
  },
                           {
                               final:finalImg
                             //  console.log(final);
                           })
    .then(data => {
      console.log(data);
          res.render('updatecommunity')
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })

 }
  })

app.post('/cphotos', (req, res) => {
community.findOne({
    cName:req.body.name
})
       .then(data => {
   // console.log("data"+data.final.path);
       res.contentType('image/jpeg');
          res.send(data.final.path)
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
});

app.get('/cusers',function(req,res){
     community.find({
    
           // search query
           //productName: 'mlbTvrndc'  
      })
      .then(data => {
          //console.log(data[0].cDesc);
         console.log(data);
        // console.log(req.session);
          res.send(data);
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
})


app.post('/desc',function(req,res){
     community.findOne({
        cName:req.body.Name,
           // search query
           //productName: 'mlbTvrndc'  
      })
      .then(data => {
          //console.log(data[0].cDesc);
         console.log(data);
        // console.log(req.session);
          res.send(data);
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
})



app.post('/mymembers',function(req,res){
     community.findOne({
        cName:{$in:[req.body.name]}
           // search query
           //productName: 'mlbTvrndc'  
      })
      .then(data => {
          //console.log(data[0].cDesc);
        // console.log(data.member);
        // console.log(req.session);
          res.send(data.member);
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
})

app.post('/myreq',function(req,res){
     community.findOne({
        cName:{$in:[req.body.name]}
           // search query
           //productName: 'mlbTvrndc'  
      })
      .then(data => {
          //console.log(data[0].cDesc);
        // console.log(data.member);
        // console.log(req.session);
          res.send(data.request);
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
})





app.get('/updatecommunity',function(req,res){
    res.render('updatecommunity');
})
app.get('/cupdatephoto/csettings',function(req,res){
    res.render('csettings');
})


app.post('/updatecommunity',function(req,res){
    res.render('updatecommunity');
})


 //Get from DB
app.get('/currentSession',function(req,res){
     product.find({
           // search query
           //productName: 'mlbTvrndc'  
      })
      .then(data => {
          console.log(data)
         console.log(req.session);
          res.send(req.session)
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
})

  app.get('/checkUser',function(req,res){
      product.find({
           // search query
           //productName: 'mlbTvrndc'  
      })
      .then(data => {
          console.log(data)
          res.send(data)
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
  })





app.post('/check',function(req,res){
    console.log(req);
    console.log(req.method);
      product.find({Email:req.body.email,Password:req.body.password})
           
      .then(data => {
        
          
          if(data.length!=0)
              {
                  
          if(data[0].Flag=='1')
              {
                  res.send("not");
              }
                  
          var i=0;
                  console.log(data[i])
                   req.session.isLogin = 1;
                    req.session.Email = data[i].Email ;
                    req.session.Name = data[i].Name;
                    req.session.DOB=data[i].DOB;
                    req.session.Gender=data[i].Gender;
                  req.session.City=data[i].City;
                  req.session.Phone=data[i].Phone;
                  req.session.role=data[i].role;
                  req.session.status="Pending";
                  console.log(req.session);
                  
                  access=1;
                  
                  res.send("successfully signed in");
                  
                
                
              
              }
          else{
          console.log(data)
          res.send("INVALID Email/Password")
          }
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
  })
/*app.get('/',(req,res)=>{
        
       res.render('/index.html'); 
        
        })*/
        
        
    app.get('/profile', function (req, res) {
  if (!req.session.islogin) {
    res.redirect('portal');
  } else {
    user.find({
        Name: req.session.Name,
        Email: req.session.Email
      })
      .then(data => {
        if (data.length != 0) {
          //console.log(data[0].name);
          res.render('portal', {
            user: data[0]
          });
        } else {
          res.redirect('/index.html');
        }
      })
      .catch(err => {
        console.error(err)
        res.send(err);
      })
  }
});    
        
        
app.get('/admin',(req,res)=>{
    console.log(access);
    if(access==1)
        {
    res.render('portal',{
    
    })
        }
    else
        {
            res.render('broken');
        }
})

        
app.get('/userlists',(req,res)=>{
    console.log(access);
    if(access==1)
        {
    res.render('userlists',{
    
    })
        }
    else
        {
            res.render('broken');
        }
})


app.get('/adduser',(req,res)=>{
    if(access==1)
        {
    res.render('adduser',{
    })
        }
    else
        {
            res.render('broken');
        }
})


app.get('/editprofile',(req,res)=>{
    if(access==1)
        {
    res.render('editprofile',{
    })
        }
    else
        {
            res.render('broken');
        }
})
app.get('/login',(req,res)=>{
    access=0;
    console.log(access);
    if(access==0)
        {
            access=0;
        req.session.isLogin=0
    res.render('/index.html',{
    })
        }
    else
        {
            res.render('broken');
        }
})

app.get('/communitylists',(req,res)=>{
    if(access==1)
        {
    res.render('communitylists',{
    })
        }
    else
        {
            res.render('broken');
        }
})

app.get('/cinfo',(req,res)=>{
    if(access==1)
        {
    res.render('cinfo',{
    })
        }
    else
        {
            res.render('broken');
        }
})

app.get('/requests',(req,res)=>{
 res.render('requests');
})
app.get('/communities',(req,res)=>{
 res.render('communities');
})

app.get('/csettings',(req,res)=>{
 res.render('csettings');
})

app.get('/createcommunity',(req,res)=>{
 res.render('createcommunity');
})

app.post('/add',function(req,res){
           let   newuser=new product({
                      Name:req.body.name,
                      Email:req.body.email,
               Password:req.body.pass,
               City:req.body.city,
               DOB:req.body.dob,
               Gender:req.body.gender,
               Phone:req.body.phone,
               role:req.body.role,
               status:req.body.status
                      
                  })  
           product.find({Email:req.body.email})

      .then(data => {
          if(data.length==0)
              {
               newuser.save()
                  res.send("ADDED");
              }
          else{
          console.log(data)
          res.send("Already added")
          }
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
  })


  app.get('/mycomm',function(req,res){
      console.log(req.body);
      community.find({
       
    
      })
      .then(data => {
          console.log(data)
          res.send(data)
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
  })



  app.post('/myrequests',function(req,res){
      //console.log(req.body);
      community.findOne({
    cName:req.body.Name
      })
      .then(data => {
          console.log(data)
          res.send(data)
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
  });



app.post('/ucomm',function(req,res){
    // console.log(req.session.Email);

product.findOneAndUpdate(
    {
        Email:req.session.Email
    },
    {
       
        $push:{Created:req.body.id}
        
    },
      {
      safe: true,                       // return updated doc
      upsert: true              // validate before update
    },
    
  function(err,doc)
        {
        if(err)
    {console.log(err);
    res.send(err);
    }
    else
        res.send("updated");
        }
    
    
    
    
    )
   
});

app.post('/ujoined',function(req,res){
    // console.log(req.session.Email);

product.findOneAndUpdate(
    {
        Email:req.session.Email
    },
    {
       
        $push:{Joined:req.body.id}
        
    },
      {
      safe: true,                       // return updated doc
      upsert: true              // validate before update
    },
    
  function(err,doc)
        {
        if(err)
    {console.log(err);
    res.send(err);
    }
    else
        res.send("updated");
        }
    
    
    
    
    )
   
});


  

app.post('/cmember',function(req,res){
    // console.log(req.session.Email);

    community.findOneAndUpdate(
    {
        cName:req.body.Name
    },
    {
       
        $push:{member:req.session.Email}
        
    },
      {
      safe: true,                       // return updated doc
      upsert: true              // validate before update
    },
    
  function(err,doc)
        {
        if(err)
    {console.log(err);
    res.send(err);
    }
    else

        res.send("updated");
        }
    
    
    
    
    )
   
});





app.post('/pushrequest',function(req,res){
    // console.log(req.session.Email);

    community.findOneAndUpdate(
    {
        cName:req.body.name
    },
    {
       
        $push:{member:req.body.email},
       
        
    },
      {
      safe: true,                       // return updated doc
      upsert: true ,
    // validate before update
    },
    
  function(err,doc)
        {
        if(err)
    {console.log(err);
    res.send(err);
    }
    else
        res.send("updated");
        }
    
    
    
    
    )
   
});


app.post('/pullrequest',function(req,res){
    // console.log(req.session.Email);

    community.findOneAndUpdate(
    {
        cName:req.body.name
    },
    {
       
        $pull:{request:req.body.email},
       
        
    },
      {
    
          multi:true// validate before update
    },
    
  function(err,doc)
        {
        if(err)
    {console.log(err);
    res.send(err);
    }
    else
        res.send("updated");
        }
    
    
    
    
    )
   
});


app.post('/crequest',function(req,res){
    // console.log(req.session.Email);

    community.findOneAndUpdate(
    {
        cName:req.body.Name
    },
    {
       
        $push:{request:req.session.Email},
        
    },
      {
      safe: true,                       // return updated doc
      upsert: true              // validate before update
    },
    
  function(err,doc)
        {
        if(err)
    {console.log(err);
    res.send(err);
    }
    else
        res.send("updated");
        }
    
    
    
    
    )
   
});


app.post('/updatecomm',function(req,res){
    community.findOneAndUpdate(
    {
        _id:req.body.id
    },
    {
        cName:req.body.name,
       cRule:req.body.rule,
        cDesc:req.body.desc
        
    },
      {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data=>{
       // res.redirect('/userlists');
        //console.log("upadate");
        res.send("updated");
    })
    .catch(err=>{
        console.error(err)
        res.send(error)
    })
});


app.post('/create',function(req,res){
    console.log("create");
    console.log(req.session.Email);
           let   newuser=new community({
            cName:req.body.Name,
               cDesc:req.body.Desc,
               cRule:req.body.rule,
               cStatus:req.body.status,
               cOEmail:req.session.Email,
               cDate:req.body.date,
               cManager:req.session.Name,
            
                      
                  })  
           community.find({})

      .then(data => {
               
               console.log("data");
          
                  console.log(data);
               newuser.save();
                  res.send("Created");
             
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
  })
app.get('/allusers',function(req,res)
       {
    product.find({}
        
    )
    .then(data=>{
        console.log(data);
        res.send(data);
       
    })
    .catch(err=>{
        console.error(err)
        res.send(err);
    })
});





app.put('/edit',function(req,res){
    product.findOneAndUpdate(
    {
        Email:req.body.email
    },
    {
        Name:req.body.name1,
        DOB:req.body.dob,
        Gender:req.body.gender,
    
        Phone:req.body.phone,
         
          City:req.body.city,
        status:req.body.status,
        
    },
      {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data=>{
       // res.redirect('/userlists');
        console.log("upadate");
        res.send("edited");
    })
    .catch(err=>{
        console.error(err)
        res.send(error)
    })
});


app.put('/cupdate',function(req,res){
    community.findOneAndUpdate(
    {
        cName:req.body.Name
    },
    {
      //  Name:req.body.Name,
         cName:req.body.cName,
          cStatus:req.body.cStatus,
        
    },
      {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data=>{
       // res.redirect('/userlists');
        console.log("upadate");
        res.send("UPDATED");
    })
    .catch(err=>{
        console.error(err)
        res.send(error)
    })
});



app.put('/update',function(req,res){
    product.findOneAndUpdate(
    {
        Email:req.body.Email
    },
    {
      //  Name:req.body.Name,
        Email:req.body.newEmail,
        Phone:req.body.Phone,
          role:req.body.role,
          City:req.body.City,
          status:req.body.status,
        
    },
      {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data=>{
       // res.redirect('/userlists');
        console.log("upadate");
        res.send("UPDATED");
    })
    .catch(err=>{
        console.error(err)
        res.send(error)
    })
});

app.put('/activate',function(req,res){
     product.findOneAndUpdate(
    {
        Email:req.body.Email
    },
    {
Flag:'1',      
        
    },
      {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data=>{
       // res.redirect('/userlists');
        console.log("upadate");
        res.send("UPDATED");
    })
    .catch(err=>{
        console.error(err)
        res.send(error)
    })
});

app.put('/deactivate',function(req,res){
     product.findOneAndUpdate(
    {
        Email:req.body.Email
    },
    {
       Flag:'0',
        
    },
      {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data=>{
       // res.redirect('/userlists');
        console.log("upadate");
        res.send("UPDATED");
    })
    .catch(err=>{
        console.error(err)
        res.send(error)
    })
});



app.post('/mail',function(req,res){
    var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {

     //  type: "login",
        user: 'muskankataria1801@gmail.com',
      pass:'xxxx'

  }
});
    var mailOptions = {
  from: 'muskankataria1801@gmail.com',
  to: req.body.sendTo,
  subject: req.body.subject,
  text: req.body.matter
};
    transporter.sendMail(mailOptions, function(error, info){
  if (error) {
     // console.log(info);
    console.log(error);
      res.send("Error")
  } 
        else {
    console.log('Email sent: ' + info.response);
      res.send("Mailed");
  }
});
})


app.get('/changepassword',function(req,res){
 
        res.render('changepassword');
    
});

app.post('/changepassword/update',function(req,res){
    
    
    product.findOneAndUpdate({
       // Email:req.session.Email;
     
        Password:req.body.oldpass,
    },{
        Password:req.body.newpass,
    },
     {
        new:true,
        runValidators:true,
    }
                            )
    .then(data=>{
       // console.log(data[0].Email);
        if(data==null){
            res.send("0");
        }
        else
            {
                res.send("1");
            }
    })
    .catch(err=>
          {
        console.error(err)
        res.send(error)
    })
});


app.post('/pagecount',(req,res)=>{
    console.log(req.body)
    product.find({
        
    })
    .then(data => {
        res.send(data)
    })
    .catch(err =>{
        res.send(error)
    })
})
app.post('/pagecount1',(req,res)=>{
    console.log(req.body)
    product.find({
        status:req.body.status
    })
    .then(data => {
        res.send(data)
    })
    .catch(err =>{
        res.send(error)
    })
})
app.post('/pagecount2',(req,res)=>{
    console.log(req.body)
    product.find({
        status:req.body.status,
        role:req.body.role
    })
    .then(data => {
        res.send(data)
    })
    .catch(err =>{
        res.send(error)
    })
})
app.post('/pagecount3',(req,res)=>{
    console.log(req.body)
    product.find({
        role:req.body.role
    })
    .then(data => {
        res.send(data)
    })
    .catch(err =>{
        res.send(error)
    })
})

app.post('/users',(req,res)=>{
    console.log(req.body)
    var pageNo=parseInt(req.body.pageNo)
    var size=parseInt(req.body.size)
    var query = {}
  if(pageNo < 0 || pageNo === 0) {
        response = {"error" : true,"message" : "invalid page number, should start with 1"};
        return res.json(response)
  }
  query.skip = size * (pageNo - 1)
  query.limit = size
    console.log(query)
    var mysort={Email:1}
    product.find().sort(mysort).skip(size * (pageNo - 1)).limit(size).exec(function(err,data){
        if(err){
            res.send("Error");
        }
        else
            {
                res.send(data);
            }
    });
})
app.post('/users1',(req,res)=>{
    console.log(req.body)
    var pageNo=parseInt(req.body.pageNo)
    var size=parseInt(req.body.size)
    var query = {}
  if(pageNo < 0 || pageNo === 0) {
        response = {"error" : true,"message" : "invalid page number, should start with 1"};
        return res.json(response)
  }
  query.skip = size * (pageNo - 1)
  query.limit = size
    console.log(query)
    product.find({
        status:req.body.status
    }).skip(size * (pageNo - 1)).limit(size).exec(function(err,data){
        if(err){
            res.send("Error");
        }
        else
            {
                res.send(data);
            }
    });
})
app.post('/users2',(req,res)=>{
    console.log(req.body)
    var pageNo=parseInt(req.body.pageNo)
    var size=parseInt(req.body.size)
    var query = {}
  if(pageNo < 0 || pageNo === 0) {
        response = {"error" : true,"message" : "invalid page number, should start with 1"};
        return res.json(response)
  }
  query.skip = size * (pageNo - 1)
  query.limit = size
    console.log(query)
    product.find({
        status:req.body.status,
        role:req.body.role
    }).skip(size * (pageNo - 1)).limit(size).exec(function(err,data){
        if(err){
            res.send("Error");
        }
        else
            {
                res.send(data);
            }
    });
})
app.post('/users3',(req,res)=>{
    console.log(req.body)
    var pageNo=parseInt(req.body.pageNo)
    var size=parseInt(req.body.size)
    var query = {}
  if(pageNo < 0 || pageNo === 0) {
        response = {"error" : true,"message" : "invalid page number, should start with 1"};
        return res.json(response)
  }
  query.skip = size * (pageNo - 1)
  query.limit = size
    console.log(query)
    product.find({
        role:req.body.role
    }).skip(size * (pageNo - 1)).limit(size).exec(function(err,data){
        if(err){
            res.send("Error");
        }
        else
            {
                res.send(data);
            }
    });
})




console.log("Running on port 3000");
app.listen(3000)