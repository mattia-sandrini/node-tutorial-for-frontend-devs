var express = require('express');
var router = express.Router();

// Add headers
router.use(function (req, res, next) {
    // Websites allowed to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Allowed request methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Allowed request headers
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    //res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Test Engie' });
});


/* Prevede la discriminazione dei contenuti in base all'id del pmv specificato nella URL */
router.get('/pmv/:pmvId/content', function(req, res, next) {
    var pmvId = req.params.pmvId;
    var body_msg = "-";

    if (pmvId == "1") {
        body_msg = "<p style=\"color: red; font-family: 'Courier New'\">Hello from <spanstyle=\"color: blue; font-family: sans-serif\"><b>Node.js</b></span>.</p>";
        res.send({ 
            id: "contenuto_1",
            type: "single-message",
            timestamp_creation: 1576160838,       
            timestamp_expiration: 1576180851, 
            timestamp_last_update: 1576160947,     
            body: body_msg
        });
    }
    else if (pmvId == "2") {
        body_msg = "<p style=\"color: red; font-family: 'Courier New'\">Lorem ipsum <spanstyle=\"color: blue; font-family: sans-serif\"><b>dolor</b></span> sit amet.</p>";
        res.send({ 
            id: "contenuto_2",
            type: "single-message",
            timestamp_creation: 1576160838,       
            timestamp_expiration: 1576180851, 
            timestamp_last_update: 1576160947,     
            body: body_msg
        });
    }
    else if (pmvId == "3") {
        body_msg_1 = "<p style=\"color: red; font-family: 'Courier New'\">Hello from <spanstyle=\"color: blue; font-family: sans-serif\"><b>Node.js</b></span>.</p>";
        body_msg_2 = "<p style=\"color: blue; font-family: 'Courier New'\">Lorem ipsum <spanstyle=\"color: blue; font-family: sans-serif\"><i>dolor</i></span> sit <b>amet</b>.</p>";
        body_msg_3 = "<p style=\"color: red; font-family: 'Courier New'\">Lorem ipsum <spanstyle=\"color: blue; font-family: sans-serif\"><b>dolor</b></span> sit amet.</p>";
        res.send({ 
            id: "contenuto_3",
            type: "multiple-message",
            timestamp_creation: 1576160838,       
            timestamp_expiration: 1576180851, 
            timestamp_last_update: 1576160947,     
            bodies: [body_msg_1, body_msg_2, body_msg_3],
            rolling_interval: 10     // Secondi di visualizzazione di ogni messaggio 
        });
    }
    else {
        res.send({ 
            error: "Id \""+pmvId+"\" inesistente!"
        });
    }
});
  






/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' });
});

/* GET Userlist page. */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        res.render('userlist', {
            "userlist" : docs
        });
    });
});

/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});

/* POST to Add User Service */
router.post('/adduser', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        "username" : userName,
        "email" : userEmail
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("userlist");
        }
    });
});

module.exports = router;
