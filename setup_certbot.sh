#!/bin/bash
set -e

DOMAIN="ssl.pronoor.com"
EMAIL="admin@pronoor.com"
WEBROOT="/var/www/$DOMAIN"

# Update system and install Certbot
sudo apt update
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot || true

# Install and enable Nginx
sudo apt install -y nginx
sudo systemctl enable --now nginx

# Create webroot directory
sudo mkdir -p $WEBROOT
sudo chown -R www-data:www-data $WEBROOT

# Create Nginx server block
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
if [ ! -f "$NGINX_CONF" ]; then
  sudo tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    root $WEBROOT;

    location / {
        try_files \$uri \$uri/ =404;
    }

    location ~ /.well-known/acme-challenge/ {
        allow all;
    }
}
EOF
  sudo ln -s "$NGINX_CONF" /etc/nginx/sites-enabled/
fi

# Check syntax and reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# Request Let's Encrypt certificate
sudo certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos --no-eff-email --redirect

# Test renewal
sudo certbot renew --dry-run