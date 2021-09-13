require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const mongoose = require('mongoose');
const mongoURI = process.env['MONGO_URI']
const { Schema } = mongoose;

const shortId = require('shortid');
const bodyParser = require('body-parser');
const isUrlHttp = require('is-url-http')

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
  const urlCode = shortId.generate()

  // verify a submitted URL
  if (!isUrlHttp(url)) {
    console.log("URL is a valid HTTP URL")
    res.json({error: 'invalid url'})
  } else {
    console.log("processing finding url")
    try {
      // check if url exists
      let findUrl = await URL.findOne({
        original_url: url
      })
      if (findUrl) {
        return res.json({
          original_url: findUrl.original_url,
          short_url: findUrl.short_url
        })
      } else {
        // create new url record
        findUrl = new URL({
          original_url: url,
          short_url: urlCode
        })
        await findUrl.save()
        return res.json({
          original_url: findUrl.original_url,
          short_url: findUrl.short_url
        })
      }
    } catch (err) {
      console.error(err)
      return res.status(500).json('oops something broke')
    }
  }
});

app.get("/api/shorturl/:url", async (req, res) => {
  try {
    const url = req.params.short_url
    const foundUrl= await URL.findOne({
      short_url: req.params.url
    })
    if (foundUrl) {
      return res.redirect(foundUrl.original_url)
    } else {
      return res.status(404).json('No URL found')
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json('oops something broke')
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
