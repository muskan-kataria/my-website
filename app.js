var express = require('express')
var path = require('path') 
var app = express()
var session = require('express-session');
var ejs=require('ejs');
var fs = require('fs');
var multer   = require('multer');
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

app.set('view engine', 'ejs');
app.set('views', viewsPath);


//Connect with db
var mongoose = require('mongoose');
var mongoDB = 'mongodb://localhost/mydatabase';
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
    Role:String,
    Status:String,
    Flag:Number,
    Joined:[String],
    Created:[String],
     photo: { contentType: String,
             image:Buffer,
             path:String }
   
  })


var communitySchema= new mongoose.Schema({
    cRule :String,
    cName:String,
    cOwner :String,
    cDate :String,
    cStatus:String,
    cDesc:String,
    cOEmail:String,
    cManager:String,
cLocation: {type:String,default:'NotAdded'},
  photoname:{type:String,default:'community.jpg'},
    member:[String],
    request:[String],
      final: { contentType: String,
             image:Buffer,
             path:String }
    //category : [{ 'abd': Number , }]
  })
var community = mongoose.model('communities',communitySchema);

var TagSchema = new mongoose.Schema({
    Name:String,
    By:String,
	Date:String
  })

var tag=  mongoose.model('tags', TagSchema);


var user = mongoose.model('users', productSchema);

const myurl = 'mongodb://localhost/mydatabase';

const MongoClient = require('mongodb').MongoClient;


MongoClient.connect(myurl, (err, client) => {
  if (err) return console.log(err)
  db = client.db('users') 
  
})


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



app.get('/',function(req,res){
	//access=0;
	
		res.render('index',{
			
		})
	
})

//Get from DB
app.get('/currentSession',function(req,res){
     user.find({
            
      })
      .then(data => {
       
          res.send(req.session)
        })
        .catch(err => {
        
          res.send(error)
        })
})


app.post('/check',function(req,res){ user.find({Email:req.body.Email,Password:req.body.Password})
           
      .then(data => {
          
          if(data[0].Flag=='0')
              {
                  res.send("Invalid");
              }
     if(data.length!=0)
              {
                  
          var i=0;
                   req.session.isLogin = 1;
                    req.session.Email = data[i].Email ;
                    req.session.Name = data[i].Name;
                    req.session.DOB=data[i].DOB;
                    req.session.Gender=data[i].Gender;
                  req.session.City=data[i].City;
                  req.session.Phone=data[i].Phone;
                  req.session.Role=data[i].Role;
                  req.session.Status=data[i].Status;
                  
                  if(data[i].Role=="User")
                  req.session.User=1;
                  else
                 req.session.User=0;
                  
                  access=1;
                  
                  res.send("successfully signed in");
                  
                
                
              
              }
         
        })
        .catch(err => {
    
          res.send("INVALID Email/Password")
        })
  })


app.post('/find',function(req,res){
    user.find({Email:req.body.Email})
    .then(data=>{
        res.send(data)
    })
    .catch(err=>{
        res.send(error)
    })
})


app.get('/adminportal',(req,res)=>{
    if(req.session.isLogin)
        {
         
                 res.render('portal1',{user:req.session})
    
      
        }
    else
        {
            res.render('index');
        }
})

app.get('/userportal',(req,res)=>{
    if(req.session.isLogin)
        {
             
    res.render('portal1',{
        user:req.session
    })
        }
    else
        {
            res.render('index');
        }
})
app.get('/edituser',(req,res)=>{
    if(req.session.isLogin)
        {
       
        if(req.session.Status=='Pending')
        res.render('editprofile',{
        user:req.session
    })
            else
             res.render('adminportal',{
                 user:req.session
    })
        }
    else
        {
            res.render('index');
        }
})

app.get('/photos', (req, res) => {
user.findOne({
    Email:req.session.Email
})
       .then(data => {
   
       res.contentType('image/jpeg');
          res.send(data.photo.path)
        })
        .catch(err => {
      
          res.send(error)
        })
});


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
  user.findOneAndUpdate(
      {
      Email:req.session.Email
  },
                           {
                               photo:finalImg
                
                           })
    .then(data => {
     
          res.render('editprofile',{user:req.session})
        })
        .catch(err => {
     
          res.send(error)
        })

 }
  })


app.get('/editprofile',(req,res)=>{
    if(access==1)
        {
    res.render('editprofile',{
        user:req.session
    })
        }
    else
        {
            res.send(error);
        }
})

app.put('/edit',function(req,res){
    user.findOneAndUpdate(
    {
        Email:req.body.email
    },
    {
        Name:req.body.name1,
        DOB:req.body.dob,
        Gender:req.body.gender,
    
        Phone:req.body.phone,
         
          City:req.body.city,
        Status:req.body.status,
        
    },
      {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data=>{
        res.send("edited");
    })
    .catch(err=>{

        res.send(error)
    })
});


app.get('/adduser',(req,res)=>{
    if(access==1)
        {
    res.render('adduser',{user:req.session
    })
        }
    else
        {
            res.send(error);
        }
})

app.post('/add',function(req,res){
           let   newuser=new user({
                      Name:req.body.name,
                      Email:req.body.email,
               Password:req.body.pass,
               City:req.body.city,
               DOB:req.body.dob,
               Gender:req.body.gender,
               Phone:req.body.phone,
               Role:req.body.role,
               Status:req.body.status
                      
                  })  
           user.find({Email:req.body.email})

      .then(data => {
          if(data.length==0)
              {
               newuser.save()
                  res.send("ADDED");
              }
          else{
          
          res.send("Already added")
          }
        })
        .catch(err => {
    
          res.send(error)
        })
  })

app.post('/mail',function(req,res){
    var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {

       type: "login",
        user: 'muskankataria1801@gmail.com',
      pass:'####'

  }
});
    var mailOptions = {
  from: 'muskankataria1801@gmail.com',
  to: req.body.sendTo,
  subject: req.body.subject,
  html:req.body.matter,
};
    transporter.sendMail(mailOptions, function(error, info){
  if (error) {
  
      res.send("Error")
  } 
        else {
  
      res.send("Mailed");
  }
});
})

app.get('/changepassword',function(req,res){
 
        res.render('changepassword',{user:req.session});
    
});

app.post('/changepassword/update',function(req,res){
    
    
    user.findOneAndUpdate({
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
        res.send(error);
    })
});


app.get('/userlists',(req,res)=>{
    if(access==1)
        {
    res.render('userlists',{user:req.session
    
    })
        }
    else
        {
            res.send(error);
        }
})

app.post('/getuserlist',function(req,res){
	if(!req.session.isLogin){
		res.render('index',{})
	}
	else{
		var count;
		count = user.countDocuments({}, function (error, c) {
      count = c;
    });
		console.log(req.body)
		var findobj={};
		var querystatus=req.body.querystatus;
		var queryrole=req.body.queryrole;
		var searchval=req.body.search.value;
		if(querystatus==0 && queryrole==0){
			user.find({}, {
          "_id": 0
        }).limit(parseInt(req.body.length)).skip(parseInt(req.body.start))
        .then(data => {
          //console.log(data);
				
				if(searchval!=''){
					var getcount=10;
					console.log(searchval)
//					findobj=Object.assign({},data);
					findobj["$or"]=[{
						"Email":{'$regex':searchval,
								'$options':'i'},
					},{
						"City":{'$regex':searchval,
								'$options':'i'},
					},{
						"Status":{'$regex':searchval,
								'$options':'i'},
					},
						{
						"Role":{'$regex':searchval,
								'$options':'i'},
					}
					]
				console.log(findobj)
				user.find(findobj).countDocuments(function(e,coun){
					getcount=coun;
				})
					.then(data2 => {
					console.log(data2)
					
					user.find(findobj).skip(parseInt(req.body.start)).limit(parseInt(req.body.length))
						.then(data1=>{
						console.log(data1)
						res.send({"recordsTotal": count,
            "recordsFiltered": getcount,
            data:data1
								 })
					})
					.catch(err => {
          console.error(err)
          res.send(err);
        })
				})
					.catch(err=>{
					console.log(err)
					res.send(err)
				})
				}
			
				else
          {
			  res.send({
            "recordsTotal": count,
            "recordsFiltered": count,
            data
          });
		  }
        })
        .catch(err => {
          console.error(err)
          res.send(err);
        })
		}
	else if (querystatus == 0 && queryrole != 0) {
      user.find({
          "Role": queryrole,
        }, {
          "_id": 0
        }).limit(parseInt(req.body.length)).skip(parseInt(req.body.start))
        .then(data => {
          //console.log(data);
          if(searchval!=''){
					var getcount=10;
					console.log(searchval)
//					findobj=Object.assign({},data);
			  findobj.Role=queryrole;
					findobj["$or"]=[{
						"Email":{'$regex':searchval,
								'$options':'i'},
					},{
						"City":{'$regex':searchval,
								'$options':'i'},
					},{
						"Status":{'$regex':searchval,
								'$options':'i'},
					},
						{
						"Role":{'$regex':searchval,
								'$options':'i'},
					}
					]
				console.log(findobj)
				user.find(findobj).countDocuments(function(e,coun){
					getcount=coun;
				})
					.then(data2 => {
					console.log(data2)
					
					user.find(findobj).skip(parseInt(req.body.start)).limit(parseInt(req.body.length))
						.then(data1=>{
						console.log(data1)
						res.send({"recordsTotal": count,
            "recordsFiltered": getcount,
            data:data1
								 })
					})
					.catch(err => {
          console.error(err)
          res.send(err);
        })
				})
					.catch(err=>{
					console.log(err)
					res.send(err)
				})
				}
			
				else
          {
			  res.send({
            "recordsTotal": count,
            "recordsFiltered": count,
            data
          });
		  }
        })
        .catch(err => {
          console.error(err)
          res.send(err);
        })
    } else if (querystatus != 0 && queryrole == 0) {
      user.find({
          "Status": querystatus,
        }, {
          "_id": 0
        }).limit(parseInt(req.body.length)).skip(parseInt(req.body.start))
        .then(data => {
          //console.log(data);
          if(searchval!=''){
					var getcount=10;
					console.log(searchval)
			  findobj.Status=querystatus;
//					findobj=Object.assign({},data);
					findobj["$or"]=[{
						"Email":{'$regex':searchval,
								'$options':'i'},
					},{
						"City":{'$regex':searchval,
								'$options':'i'},
					},{
						"Status":{'$regex':searchval,
								'$options':'i'},
					},
						{
						"Role":{'$regex':searchval,
								'$options':'i'},
					}
					]
				console.log(findobj)
				user.find(findobj).countDocuments(function(e,coun){
					getcount=coun;
				})
					.then(data2 => {
					console.log(data2)
					
					user.find(findobj).skip(parseInt(req.body.start)).limit(parseInt(req.body.length))
						.then(data1=>{
						console.log(data1)
						res.send({"recordsTotal": count,
            "recordsFiltered": getcount,
            data:data1
								 })
					})
					.catch(err => {
          console.error(err)
          res.send(err);
        })
				})
					.catch(err=>{
					console.log(err)
					res.send(err)
				})
				}
			
				else
          {
			  res.send({
            "recordsTotal": count,
            "recordsFiltered": count,
            data
          });
		  }
        })
    } else {
      user.find({
          "Status": querystatus,
          "Role": queryrole,
        }, {
          "_id": 0
        }).limit(parseInt(req.body.length)).skip(parseInt(req.body.start))
        .then(data => {
          //console.log(data);
         if(searchval!=''){
					var getcount=10;
					console.log(searchval)
//					findobj=Object.assign({},data);
			 findobj.Status=querystatus;
			 findobj.Role=queryrole;
					findobj["$or"]=[{
						"Email":{'$regex':searchval,
								'$options':'i'},
					},{
						"City":{'$regex':searchval,
								'$options':'i'},
					},{
						"Status":{'$regex':searchval,
								'$options':'i'},
					},
						{
						"Role":{'$regex':searchval,
								'$options':'i'},
					}
					]
				console.log(findobj)
				user.find(findobj).countDocuments(function(e,coun){
					getcount=coun;
				})
					.then(data2 => {
					console.log(data2)
					
					user.find(findobj).skip(parseInt(req.body.start)).limit(parseInt(req.body.length))
						.then(data1=>{
						console.log(data1)
						res.send({"recordsTotal": count,
            "recordsFiltered": getcount,
            data:data1
								 })
					})
					.catch(err => {
          console.error(err)
          res.send(err);
        })
				})
					.catch(err=>{
					console.log(err)
					res.send(err)
				})
				}
			
				else
          {
			  res.send({
            "recordsTotal": count,
            "recordsFiltered": count,
            data
          });
		  }
        })
    }
  }
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
          res.render('updatecommunity',{user:req.session})
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

app.get('/cphotos', (req, res) => {
community.findOne({
    
})
       .then(data => {
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
        _id:req.body.id,
           // search query
           //productName: 'mlbTvrndc'  
      })
      .then(data => {
          //console.log(data[0].cDesc);
      
        // console.log(req.session);
          res.send(data);
        })
        .catch(err => {
       
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
         
          res.send(error)
        })
})





app.get('/updatecommunity',function(req,res){
    res.render('updatecommunity',{user:req.session});
})
app.get('/cupdatephoto/csettings',function(req,res){
    res.render('csettings',{user:req.session});
})


app.post('/updatecommunity',function(req,res){
    res.render('updatecommunity',{user:req.session});
})

app.get('/cinfo',(req,res)=>{
    if(access==1)
        {
    res.render('cinfo',{user:req.session
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
        user:req.session
    })
        }
    else
        {
            res.send(error);
        }
})

app.get('/requests',(req,res)=>{
 res.render('requests',{user:req.session});
})
app.get('/communities',(req,res)=>{
 res.render('communities',{user:req.session});
})

app.get('/csettings',(req,res)=>{
 res.render('csettings',{user:req.session});
})

app.get('/createcommunity',(req,res)=>{
 res.render('createcommunity',{user:req.session});
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

user.findOneAndUpdate(
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

user.findOneAndUpdate(
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
               cOwner:req.session.Role,
            
                      
                  })  
           community.find({})

      .then(data => {
               
            
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
    user.find({}
        
    )
    .then(data=>{
    
        res.send(data);
       
    })
    .catch(err=>{
    
        res.send(err);
    })
});







app.put('/cupdate',function(req,res){
    community.findOneAndUpdate(
    {
        _id:req.body.id
    },
    {
      //  Name:req.body.Name,
         cName:req.body.cName,
          cStatus:req.body.Status,
        
    },
      {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data=>{
       // res.redirect('/userlists');
    
        res.send("UPDATED");
    })
    .catch(err=>{
        
        res.send(error)
    })
});



app.put('/update',function(req,res){
    user.findOneAndUpdate(
    {
        Email:req.body.Email
    },
    {
      //  Name:req.body.Name,
        Email:req.body.newEmail,
        Phone:req.body.Phone,
          Role:req.body.role,
          City:req.body.City,
          Status:req.body.status,
        
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

app.post('/updateuser',function(req,res){
	user.findOneAndUpdate(
    {
        Email: req.body.Email  // search query
    },
        {
      		Phone:req.body.Phno,
            City:req.body.city,
            Role:req.body.role,
            Status:req.body.status,
    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
    .then(data => {
        
        res.send("UPDATED");
      })
      .catch(err => {
        console.error(err)
        res.send(error)
      })
})

app.post('/enableuser',function(req,res){
    user.findOneAndUpdate(
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

        res.send("UPDATED");
    })
    .catch(err=>{
        console.error(err)
        res.send(error)
    })
});

app.post('/disableuser',function(req,res){
     user.findOneAndUpdate(
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
       console.log("disable");
        res.send("UPDATED");
    })
    .catch(err=>{
       
        res.send(error)
    })
});







app.post('/cupdate', function (req, res) {
  community.findOneAndUpdate({
      //search query
      cOEmail: req.body.email,
      cName: req.body.origcommname,
    }, {
      // field:values to update
      cName: req.body.commname,
      cStatus: req.body.status,
    }, {
      new: true, // return updated doc
      runValidators: true // validate before update
    })
    .then(data => {
      res.redirect('/community/communityList');
    })
    .catch(err => {
      console.error(err)
      res.send(err);
    })
});


app.post('/cdata',function(req,res){
	if(!req.session.isLogin){
		res.render('index',{})
	}
	else{
		var count;
		count = community.countDocuments({}, function (error, c) {
      count = c;
    });
		console.log(req.body)
		var findobj={};
		var querystatus=req.body.querypermission;
				var searchval=req.body.search.value;

		if(querystatus==0){
			community.find({}, {
        }).limit(parseInt(req.body.length)).skip(parseInt(req.body.start))
        .then(data => {
          //console.log(data);
				
				if(searchval!=''){
					var getcount=10;
				
//					findobj=Object.assign({},data);
					findobj["$or"]=[{
						"cName":{'$regex':searchval,
								'$options':'i'},
					},{
						"cRule":{'$regex':searchval,
								'$options':'i'},
					},{
						"cLocation":{'$regex':searchval,
								'$options':'i'},
					},
						{
						"cOwner":{'$regex':searchval,
								'$options':'i'},
					}
					]
			
				community.find(findobj).countDocuments(function(e,coun){
					getcount=coun;
				})
					.then(data2 => {
				
					
					community.find(findobj).skip(parseInt(req.body.start)).limit(parseInt(req.body.length))
						.then(data1=>{
					
						res.send({"recordsTotal": count,
            "recordsFiltered": getcount,
            data:data1
								 })
					})
					.catch(err => {
          console.error(err)
          res.send(err);
        })
				})
					.catch(err=>{
					console.log(err)
					res.send(err)
				})
				}
			
				else
          {
			  res.send({
            "recordsTotal": count,
            "recordsFiltered": count,
            data
          });
		  }
        })
        .catch(err => {
          console.error(err)
          res.send(err);
        })
		}
	
		else if (querystatus != 0) {
      community.find({
          "cRule": querystatus,
        }, {
          "_id": 0
        }).limit(parseInt(req.body.length)).skip(parseInt(req.body.start))
        .then(data => {
          //console.log(data);
          if(searchval!=''){
					var getcount=10;
					console.log(searchval)
			  findobj.cRule=querystatus;
//					findobj=Object.assign({},data);
					findobj["$or"]=[{
						"cName":{'$regex':searchval,
								'$options':'i'},
					},{
						"cRule":{'$regex':searchval,
								'$options':'i'},
					},{
						"cLocation":{'$regex':searchval,
								'$options':'i'},
					},
						{
						"cOwner":{'$regex':searchval,
								'$options':'i'},
					}
					]
				console.log(findobj)
				community.find(findobj).countDocuments(function(e,coun){
					getcount=coun;
				})
					.then(data2 => {
					console.log(data2)
					
					community.find(findobj).skip(parseInt(req.body.start)).limit(parseInt(req.body.length))
						.then(data1=>{
						console.log(data1)
						res.send({"recordsTotal": count,
            "recordsFiltered": getcount,
            data:data1
								 })
					})
					.catch(err => {
          console.error(err)
          res.send(err);
        })
				})
					.catch(err=>{
					console.log(err)
					res.send(err)
				})
				}
			
				else
          {
			  res.send({
            "recordsTotal": count,
            "recordsFiltered": count,
            data
          });
		  }
        })
    }
		
  }
});

app.get('/listtags',(req,res)=>{
    if(req.session.isLogin)
        {
    res.render('taglist',{user:req.session}
    )
        }
    else
        {
            res.render('index');
        }
})

app.post('/addtag',function(req,res){
console.log(req.body)
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	date=date.toString();
	
    let   newtag=new tag({
                      Name:req.body.tagname,
						By:req.session.Email,
						Date:date
                  })  
           tag.find({Name:req.body.tagname})

      .then(data => {
          if(data.length==0)
              {
               newtag.save()
                  res.send("Added");
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
app.post('/gettagslist',function(req,res){
	if(!req.session.isLogin){
		res.render('index',{})
	}
	else{
		var count;
		count = tag.countDocuments({}, function (error, c) {
      count = c;
    });
		console.log(req.body)
		var findobj={};
				var searchval=req.body.search.value;

			tag.find({}, {
        }).limit(parseInt(req.body.length)).skip(parseInt(req.body.start))
        .then(data => {
          //console.log(data);
				
				if(searchval!=''){
					var getcount=10;
					console.log(searchval)
//					findobj=Object.assign({},data);
					findobj["$or"]=[{
						"Name":{'$regex':searchval,
								'$options':'i'},
					},{
						"By":{'$regex':searchval,
								'$options':'i'},
					}
					
					]
				console.log(findobj)
				tag.find(findobj).countDocuments(function(e,coun){
					getcount=coun;
				})
					.then(data2 => {
					console.log(data2)
					
					tag.find(findobj).skip(parseInt(req.body.start)).limit(parseInt(req.body.length))
						.then(data1=>{
						console.log(data1)
						res.send({"recordsTotal": count,
            "recordsFiltered": getcount,
            data:data1
								 })
					})
					.catch(err => {
          console.error(err)
          res.send(err);
        })
				})
					.catch(err=>{
					console.log(err)
					res.send(err)
				})
				}
			
				else
          {
			  res.send({
            "recordsTotal": count,
            "recordsFiltered": count,
            data
          });
		  }
        })
        .catch(err => {
          console.error(err)
          res.send(err);
        })
	}
		
});
app.post('/deletetag',function(req,res){
	tag.remove({
		Name:req.body.Name
	})
		.then(data => {
          res.send('Deleted Successfully')
        })
    .catch(err => {
          console.error(err)
          res.send(error)
        })
})

app.get('/tags',(req,res)=>{
    if(req.session.isLogin)
        {
    res.render('createtag',{user:req.session})
        }
    else
        {
            res.render('index');
        }
})


console.log("Running on port 3000");
app.listen(3000)
