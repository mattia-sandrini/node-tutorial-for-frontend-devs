var express = require('express');
//var cors = require('cors')
var router = express.Router();


function getDeviceIndex(device_list, id) {
    for (let i = 0; i < device_list.length; i++) {
        if (device_list[i].id == id) {
            return i;
        }
    }
    return null;
}



// Add headers
router.use(function (req, res, next) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

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
  var device_list = req.app.locals.device_list;
  res.render('index', { title: 'Ambiente di Test: Integrazione PMV/Totem - Livin\'', device_list: device_list });
});


function getDeviceIndex(device_list, id) {
    for (let i = 0; i < device_list.length; i++) {
        if (device_list[i].id == id) {
            return i;
        }
    }
    return null;
}


/* Permette la discriminazione dei contenuti in base all'id del pmv specificato nella URL */
router.get('/pmv/:pmvId/content', function(req, res, next) {
    var device_list = req.app.locals.device_list;
    var pmvId = req.params.pmvId;
    var requested_device = getDeviceIndex(device_list, pmvId);

    if (requested_device != null) {
        res.send(device_list[requested_device].content);
    } 
    else {
        res.status(404).send({error: "Id \""+pmvId+"\" inesistente!"});
    }
});
  


// Il PMV aggiorna lo stato del contenuto visualizzato come feedback alla richiesta di ottenere il contenuto da visualizzare

router.put('/pmv/:pmvId/content/:contentId', function(req, res) {
    var device_list = req.app.locals.device_list;

    var pmvId = req.params.pmvId;
    var contentId = req.params.contentId;

    var status = req.body.status;        // "displayed|expired|rejected"
    var timestamp = req.body.timestamp;

    var requested_device = getDeviceIndex(device_list, pmvId);

    if (requested_device != null) {
        if (req.body.hasOwnProperty("error")) {
            device_list[requested_device].content.status = status;
            device_list[requested_device].content.error = req.body.error;

            req.app.locals.logs[device_list[requested_device].id].push({ type: 'error', msg: req.body.error, timestamp: timestamp });

            // TODO: trattare la presenza dell'errore

            res.send({success: "Feedback ricevuto.", 
                device: device_list[requested_device],
                // TODO: eliminare le righe sottostanti (utile solo in fase di test)
                //content_id: contentId,
                //status: status, 
                error: req.body.error,
                timestamp: timestamp
            });
        }
        else {
            // Tutto OK
            device_list[requested_device].content.status = status;
            delete(device_list[requested_device].content.error);

            req.app.locals.logs[device_list[requested_device].id].push({ type: 'info', msg: 'PMV "'+pmvId+'" -> Content "'+device_list[requested_device].content.id+'": '+status, timestamp: timestamp });

            res.send({success: "Feedback ricevuto.", 
                device: device_list[requested_device],
                // TODO: eliminare le righe sottostanti (utile solo in fase di test)
                //content_id: contentId,
                //status: status, 
                timestamp: timestamp
            });
        }
    }
    else {
        res.status(404).send({error: "Id \""+pmvId+"\" inesistente!"});
    }
});

// Heartbeat
router.put('/pmv/:pmvId/status', function(req, res) {
    var device_list = req.app.locals.device_list;

    var pmvId = req.params.pmvId;

    var status = req.body.status;    // "active/idle/stale" --> Il PMV può essere in modalità di visualizzazione del messaggio, o in stallo
    var displayedContentId = req.body.displayed_content;
    var timestamp = req.body.timestamp;


    var requested_device = getDeviceIndex(device_list, pmvId);

    if (requested_device != null) {
        device_list[requested_device].status = status;
        device_list[requested_device].displayed_content = displayedContentId;
        device_list[requested_device].last_heartbeat = timestamp;

        req.app.locals.logs[device_list[requested_device].id].push({ type: 'info', msg: 'PMV "'+pmvId+'" -> Stato: '+status, timestamp: timestamp });

        res.send({success: "Stato aggiornato con successo.", 
            device: device_list[requested_device],
            // TODO: eliminare le righe sottostanti (utile solo in fase di test)
            //status: status, 
            //displayed_content: displayedContentId,
            timestamp: timestamp
        });
    }
    else {
        res.status(404).send({error: "Id \""+pmvId+"\" inesistente!"});
    }
});






router.get('/pmv/:pmvId', function(req, res) {
    var device_list = req.app.locals.device_list;

    var pmvId = req.params.pmvId;
    var requested_device = getDeviceIndex(device_list, pmvId);

    if (requested_device != null) {
        res.send({device: device_list[requested_device], logs: req.app.locals.logs[device_list[requested_device].id]});
    } 
    else {
        res.status(404).send({error: "Id \""+pmvId+"\" inesistente!"});
    }
});

router.put('/pmv/:pmvId', function(req, res) {
    var device_list = req.app.locals.device_list;
    
    var pmvId = req.params.pmvId;

    var content = req.body.content;   
    var requested_device = getDeviceIndex(device_list, pmvId);

    if (requested_device != null) {
        device_list[requested_device].content = content;
        res.send(device_list[requested_device]);
    } 
    else {
        res.status(404).send({error: "Id \""+pmvId+"\" inesistente!"});
    }
});

router.get('/pmv/:pmvId/logs', function(req, res) {
    var device_list = req.app.locals.device_list;

    var pmvId = req.params.pmvId;
    var requested_device = getDeviceIndex(device_list, pmvId);

    if (requested_device != null) {
        res.send(req.app.locals.logs[device_list[requested_device].id]);
    } 
    else {
        res.status(404).send({error: "Id \""+pmvId+"\" inesistente!"});
    }
});



module.exports = router;
