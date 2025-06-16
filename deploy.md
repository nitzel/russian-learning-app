# Deployment Guide

This guide explains how to deploy the Russian Learning App to a Debian VM with nginx.

## Prerequisites

- Debian VM with nginx installed
- Node.js and npm installed
- SSH access to the server
- Domain pointed to server IP (russian.exegames.de)

## Deployment Steps

### 1. Connect to Server

```bash
ssh your-user@russian.exegames.de
```

### 2. Install Node.js (if not already installed)

```bash
# Update package list
sudo apt update

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Clone and Build the Application

```bash
# Navigate to web directory
cd /var/www

# Clone the repository
sudo git clone https://github.com/nitzel/russian-learning-app.git
cd russian-learning-app

# Install dependencies
sudo npm install

# Build for production
sudo npm run build
```

### 4. Configure Nginx

Create nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/russian.exegames.de
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name russian.exegames.de;

    root /var/www/russian-learning-app/build;
    index index.html;

    # Serve React app
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 5. Enable the Site

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/russian.exegames.de /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 6. Set Up SSL with Let's Encrypt (Optional but Recommended)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d russian.exegames.de

# Test automatic renewal
sudo certbot renew --dry-run
```

### 7. Set Proper Permissions

```bash
# Set ownership
sudo chown -R www-data:www-data /var/www/russian-learning-app

# Set permissions
sudo chmod -R 755 /var/www/russian-learning-app
```

## Updating the Application

To update the app when you make changes:

```bash
# Navigate to app directory
cd /var/www/russian-learning-app

# Pull latest changes
sudo git pull origin main

# Install any new dependencies
sudo npm install

# Rebuild the application
sudo npm run build

# Reload nginx (if needed)
sudo systemctl reload nginx
```

## Automation Script

Create an update script for easier deployments:

```bash
sudo nano /usr/local/bin/update-russian-app.sh
```

Add the following content:

```bash
#!/bin/bash

APP_DIR="/var/www/russian-learning-app"
LOG_FILE="/var/log/russian-app-deploy.log"

echo "$(date): Starting deployment..." >> $LOG_FILE

cd $APP_DIR

# Pull latest changes
git pull origin main >> $LOG_FILE 2>&1

# Install dependencies
npm install >> $LOG_FILE 2>&1

# Build application
npm run build >> $LOG_FILE 2>&1

# Set proper permissions
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR

# Reload nginx
systemctl reload nginx

echo "$(date): Deployment completed successfully!" >> $LOG_FILE
```

Make the script executable:

```bash
sudo chmod +x /usr/local/bin/update-russian-app.sh
```

Now you can update with:

```bash
sudo /usr/local/bin/update-russian-app.sh
```

## Troubleshooting

### Check nginx status
```bash
sudo systemctl status nginx
```

### Check nginx error logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### Check application build
```bash
cd /var/www/russian-learning-app
sudo npm run build
```

### Verify file permissions
```bash
ls -la /var/www/russian-learning-app/build/
```

## Notes

- The app will be accessible at http://russian.exegames.de (or https:// if SSL is configured)
- Build files are generated in the `build/` directory
- Nginx serves the static React build files
- The React router is configured to work with nginx's `try_files` directive
- Make sure your DNS is properly configured to point to your server IP

## Security Considerations

- Keep Node.js and npm updated
- Regularly update the application dependencies
- Monitor nginx access and error logs
- Consider setting up fail2ban for SSH protection
- Keep certbot certificates renewed automatically