const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000; // Adjusted port

// Launch browser within a function to handle asynchronous setup
async function startBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Necessary for running Puppeteer on Render
  });
  return browser;
}

// Route to fetch channel information
app.get('/:channelName', async (req, res) => {
  try {
    const browserInstance = await startBrowser(); // Start a new browser instance for each request
    const page = await browserInstance.newPage();
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

    await browserInstance.close(); // Close the browser instance after use
    res.json(channelInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
