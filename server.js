const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const shortId = require('shortid');
const app = express();

mongoose.connect('mongodb://localhost/urlShortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.render('index', { shortUrls: shortUrls });
});

app.post('/shortUrls', async (req, res) => {
  let newShortId = shortId.generate();
  while (true) {
    if (!(await ShortUrl.findOne({ short: newShortId }))) {
      break;
    } else {
      newShortId = shortId.generate();
    }
  }
  await ShortUrl.create({ full: req.body.fullUrl, short: newShortId });
  res.redirect('/');
});

app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  if (shortUrl == null) return res.sendStatus(404);

  shortUrl.clicks++;
  shortUrl.save();

  res.redirect(shortUrl.full);
});

app.get('/delete/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  await ShortUrl.deleteOne(shortUrl);
  res.redirect('/');
});

app.listen(process.env.PORT || 5000);
