require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const mongoose = require('mongoose');
const mongoURI = process.env['MONGO_URI']
const { Schema } = mongoose;

const shortId = require('shortid');
const bodyParser = require('body-parser');
const validUrl = require('valid-url');

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

//Create url Schema
const urlSchema = new Schema({
  original_url: { type: String, required: true },
  short_url: { type: String, required: true }
})
const URL = mongoose.model("URL", urlSchema);

app.use(bodyParser.urlencoded({
  extended: false
}))

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

// for parsing application/json
app.use(express.json())
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })) 

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Short URL Creation
app.post("/api/shorturl", async (req, res) => {
  const url = req.body.url

  const canResolve = hostname =>
    new Promise(resolve => {
      dns.lookup(hostname, err => { 
      if (err && err.code === 'ENOTFOUND') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  })

  const result = await canResolve(url);
  console.log(result)

  if(!result) return res.status(400).send({ error: 'invalid url' }); 

  res.json({
    original_url : url, 
    short_url : 1
  });
});

app.get("/api/shorturl/:id", (req, res) => {
  const ipaddress = req.params.id
  res.json({
    original_url : 'https://freeCodeCamp.org', 
    short_url : 1
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
