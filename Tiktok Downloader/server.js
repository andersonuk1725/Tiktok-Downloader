const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.post('/api/download', async (req, res) => {
  const { url } = req.body;
  if (!url || !url.includes('tiktok.com')) {
    return res.json({ success: false, error: 'Invalid TikTok URL' });
  }

  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const content = await page.content();
    const match = content.match(/"playAddr":"(.*?)"/);
    await browser.close();

    if (match && match[1]) {
      const videoUrl = match[1].replace(/\u0026/g, '&');
      res.json({ success: true, url: videoUrl });
    } else {
      res.json({ success: false, error: 'Failed to extract video URL.' });
    }
  } catch (err) {
    res.json({ success: false, error: 'Error scraping TikTok: ' + err.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
