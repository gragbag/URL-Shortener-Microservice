require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


let shortIndex = 0;
const urls = new Map();
const shortUrls = new Map();

app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;
  const hostname = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

  dns.lookup(hostname, (error, address, family) => {
    if (error) {
      res.send({
        "error": "invalid url"
      });
    } else {
      let url_index = 0;
      if (urls.has(url)) {
        url_index = urls.get(url);
      } else {
        shortIndex++;
        url_index = shortIndex;
        urls.set(url, url_index);
        shortUrls.set(url_index, url);
      }

      res.send({
        original_url: url,
        short_url: url_index
      })
    }
  })

  
})

app.use('/api/shorturl/:short_url', (req, res) => {
  const url = shortUrls.get(Number.parseInt(req.params.short_url));
  if (!url) {
    res.send({
      "error": "invalid short url"
    });
    return
  }
  res.redirect(url);
})
