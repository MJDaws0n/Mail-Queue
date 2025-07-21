# Mail Queue System

This is a basic mail queue system made of:
	•	server.js: An Express server handling the email queue and sending via Brevo (SendinBlue) API.
	•	queue.php: A PHP client class to interact with the queue API.

Note: server.js could really do with a refactor and better security, you’ve been warned.

## Setup

Prerequisites
	•	Node.js installed on your server/machine.
	•	PHP 7+ if using the PHP class.
	•	Brevo (SendinBlue) API key.

1. Configure server.js

Update the following constants at the top of server.js:
```javascript
const PORT = 1056; // or any port, typically behind a reverse proxy
const API_KEY = 'your internal API key for PHP client';
const EMAIL_API_KEY = 'your Brevo API key';
const ALLOWED_IPS = ['your.allowed.ip', 'another.allowed.ip']; // Add as many as you want (will use the IP as whats in the referer header)
const ALLOWED_HOSTNAME = 'your-domain.com';
```

You should really replace the hardcoded keys with environment variables but this version skips that.

2. Running the Node Server
```sh
npm install express body-parser axios
node server.js
```

You’ll probably want to reverse proxy this over HTTPS on port 443, especially since it checks for the hostname in requests.

3. PHP Client Usage

Use the MailQueue class in your PHP app to send emails via the queue:
```php
$mailQueue = new MailQueue\MailQueue('api-key-you-set-in-node', 'http://your-server-address:1056');
$mailQueue->setRecipient('user@example.com', 'User Name');
$mailQueue->setSubject('Subject here');
$mailQueue->setHtmlContent('<h1>Hello!</h1>');
$response = $mailQueue->send();
```

## Security Notes
  •	IP checks and hostname validation are in place, but you should still:
	•	Move the API keys to a .env file.
	•	Implement rate limiting and logging.
	•	If possible, lock down your reverse proxy to only allow specific origins.
	•	Add some authentication layer on top if you want extra safety.

## Future Improvements
  •	Migrate server.js to use dotenv for configs.
	•	Implement better async queue handling (e.g., use a job queue like Bull).
	•	Add retry logic on email failures.
	•	Consider proper logging & metrics.
