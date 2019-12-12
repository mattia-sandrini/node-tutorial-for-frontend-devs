var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send({1: "ciao", "bella": 2});
});

module.exports = router;
