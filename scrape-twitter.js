const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
require('dotenv').config();

puppeteer.use(StealthPlugin());

const searchUrl = process.env.SEARCH_URL;
const cookie = process.env.TWITTER_COOKIE;

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Inject auth cookie
    if (cookie) {
      await page.setCookie(
        { name: 'auth_token', value: cookie, domain: '.x.com' },
        { name: 'auth_token', value: cookie, domain: '.twitter.com' }
      );
    }

    console.log('Navigating to:', searchUrl);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

    // CAPTCHA / login check
    if (await page.$('input[name="session[username_or_email]"]')) throw new Error('Login screen');
    if (await page.$('div[data-testid="captcha"]')) throw new Error('CAPTCHA encountered');

    // Wait for tweets
    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.waitForSelector('article', { timeout: 60000 });

    // Scrape tweets
    const tweets = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('article').forEach(article => {
        const text = article.innerText;
        const linkEl = article.querySelector('a[href*="/status/"]');
        const link = linkEl ? 'https://x.com' + linkEl.getAttribute('href') : '';
        const verified = !!article.innerHTML.match(/Verified account|aria-label="Verified"/i);

        let likes = 0;
        const likeDiv = [...article.querySelectorAll('div[aria-label]')]
          .find(el => el.getAttribute('aria-label')?.includes('Like'));
        if (likeDiv) {
          const match = likeDiv.getAttribute('aria-label').match(/([\d,\.]+)\s+Like/);
          if (match) likes = parseInt(match[1].replace(/[,\.]/g, ''));
        }

        results.push({ text, link, likes, verified });
      });
      return results;
    });

    console.log(JSON.stringify(tweets, null, 2));
  } catch (err) {
    console.error('SCRAPER ERROR:', err.message);
    process.exit(1);
  } finally {
    if (browser && browser.process() != null) await browser.close();
  }
})();
