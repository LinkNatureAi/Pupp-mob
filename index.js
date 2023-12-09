const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3300;

let browserInstance = puppeteer.launch({ headless: true });

app.get('/:channelName', async (req, res) => {
  try {
    const page = await (await browserInstance).newPage();
    const { channelName } = req.params;
    const url = `https://www.youtube.com/results?search_query=@${channelName}`;

    await Promise.all([
      page.goto(url),
      page.waitForSelector('#metadata-line')
    ]);

    const channelInfo = await page.evaluate(() => ({
      channel: document.querySelector('#subscribers')?.textContent.trim().replace("@", "") || 'Channel name not found',
      subscribers: document.querySelector('#video-count')?.textContent.trim() || 'Subscribers count not found'
    }));

    await page.close();
    res.json(channelInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
