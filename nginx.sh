#!/bin/bash


echo "Starting Nginx Configuration..."
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "Please run with sudo: sudo ./setup-nginx.sh"
    exit 1
fi

# Prompt for domain or IP
read -p "Enter your domain or IP address (e.g., 13.211.39.17): " DOMAIN_OR_IP

if [ -z "$DOMAIN_OR_IP" ]; then
    echo "Domain/IP cannot be empty!"
    exit 1
fi

echo ""
echo "Creating Nginx configuration..."

# Create nginx config file
cat > /etc/nginx/sites-available/app << EOF
server {
    listen 80;
    server_name $DOMAIN_OR_IP;

    # Increase timeouts for large requests
    client_max_body_size 10M;
    client_body_timeout 60s;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API (Express)
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Origin \$http_origin;
    }

    # Next.js static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

echo "Nginx configuration created at /etc/nginx/sites-available/app"
echo ""

echo "Enabling site..."
ln -sf /etc/nginx/sites-available/app /etc/nginx/sites-enabled/

echo "Removing default site..."
rm -f /etc/nginx/sites-enabled/default

echo ""
echo "Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo ""
    echo "Restarting Nginx..."
    systemctl restart nginx
    
    echo ""
    echo "Nginx configuration completed successfully!"
    echo ""
    echo "Your application should now be accessible at: http://$DOMAIN_OR_IP"
else
    echo ""
    echo "Nginx configuration test failed!"
    echo "Please check the errors above and fix them."
    exit 1
fi
