# Podha Twitter/X Listener Workflow

This project is a no-code/low-code n8n workflow that monitors Twitter/X for posts related to Podha Protocol and RWA narratives, without using the Twitter API. It scrapes the X (Twitter) search page, filters tweets, and sends results to a Discord channel every hour.

---

## Features
- **No Twitter API required**: Uses Puppeteer to scrape X (Twitter) search results.
- **Authentication**: Uses your Twitter/X session cookie for access.
- **Filtering**: Only blue-verified accounts, minimum 3 likes, logical keyword support.
- **De-duplication**: Avoids re-sending previously seen tweets.
- **Scheduler**: Runs every hour (or manually).
- **Discord Integration**: Sends tweet previews and links to a Discord channel via webhook.

---

## Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) (optional, for containerized n8n)
- [n8n](https://n8n.io/) (self-hosted or Docker)
- A Discord webhook URL
- Your Twitter/X session cookie (`auth_token`)

---

## Setup

### 1. Clone or Download the Project

```
git clone https://github.com/yourusername/podha-twitter-listener.git
cd podha-twitter-listener
```

Or just copy all files to a folder, e.g. `C:/Users/DELL/Desktop/twitter-listening-workflow`.

### 2. Install Dependencies

```
npm install puppeteer-extra puppeteer-extra-plugin-stealth puppeteer dotenv
```

### 3. Set Up Environment Variables

Create a `.env` file in the project folder:

```
TWITTER_COOKIE=your_auth_token_here
```
- Replace `your_auth_token_here` with your actual Twitter/X `auth_token` cookie value.
- To get your `auth_token`, log in to Twitter/X in your browser, open DevTools → Application/Storage → Cookies, and copy the value for `auth_token`.

### 4. Configure n8n

- Import `n8n_workflow.json` into your n8n instance.
- In the **Scrape Twitter** (Execute Command) node, ensure the command is:
  - For Docker: `node /data/scrape-twitter.js`
  - For local Windows: `node C:/Users/DELL/Desktop/twitter-listening-workflow/scrape-twitter.js`
- Set the `TWITTER_COOKIE` environment variable in the node if not using `.env`.
- Set your Discord webhook URL in the **Send to Discord** node.

### 5. Run n8n

#### **A. Docker (Recommended for Windows)**

From your project directory, run:

```
docker run -it --rm -v "%cd%":/data -p 5678:5678 -e N8N_BASIC_AUTH_ACTIVE=true -e N8N_BASIC_AUTH_USER=admin -e N8N_BASIC_AUTH_PASSWORD=admin -e NODE_ENV=production -w /data --name podha-n8n n8nio/n8n
```

- This mounts your project folder to `/data` in the container.
- Access n8n at [http://localhost:5678](http://localhost:5678) (login: admin/admin).

#### **B. Local (Windows)**

If you run n8n locally, just ensure the script path in the workflow matches your local path.

---

## Usage

- The workflow runs every hour (or can be triggered manually).
- It scrapes X (Twitter) for relevant tweets, filters them, de-duplicates, and sends new ones to Discord.
- You can adjust keywords, filters, and schedule in the n8n UI.

---

## Troubleshooting

- **Cannot find module errors**: Make sure all dependencies are installed in your project folder.
- **Script not found**: Ensure `scrape-twitter.js` exists in the correct path and is mounted in Docker.
- **No tweets found or login page shown**: Your `TWITTER_COOKIE` may be missing or expired. Get a fresh one from your browser.
- **CAPTCHA or rate limit**: Try a different account or wait before retrying.

---

## Customization
- Change keywords by editing the `SEARCH_URL` in the workflow or `.env`.
- Adjust filters (likes, verified) in the n8n workflow nodes.
- Add more output fields or destinations as needed.

---

## License
MIT 