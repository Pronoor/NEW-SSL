#!/bin/bash
# Proper Laravel Installation Script

set -e

echo "🚀 Setting up Laravel SSL Certificate Manager..."

# Backup custom files
echo "📦 Backing up custom files..."
mkdir -p _temp_backup
cp -r app routes database/migrations/2024_01_01_000001_create_certificates_table.php _temp_backup/ 2>/dev/null || true
cp setup_certbot.sh _temp_backup/ 2>/dev/null || true

# Create a fresh Laravel installation in a temp directory
echo "📥 Installing Laravel..."
cd /tmp
rm -rf laravel-ssl-temp
composer create-project laravel/laravel laravel-ssl-temp --prefer-dist --no-interaction

# Copy Laravel files to project directory
echo "📋 Copying Laravel files..."
cd /Users/imtiaz/Desktop/click/SSL
cp -r /tmp/laravel-ssl-temp/* .
cp -r /tmp/laravel-ssl-temp/.* . 2>/dev/null || true

# Restore custom files
echo "🔄 Restoring custom files..."
cp -r _temp_backup/app/* app/
cp -r _temp_backup/routes/* routes/
cp _temp_backup/2024_01_01_000001_create_certificates_table.php database/migrations/
cp _temp_backup/setup_certbot.sh .

# Install phpseclib for SSH
echo "📦 Installing additional dependencies..."
composer require phpseclib/phpseclib:^3.0

# Cleanup
echo "🧹 Cleaning up..."
rm -rf /tmp/laravel-ssl-temp
rm -rf _temp_backup

echo "✅ Laravel installation complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env: cp .env.example .env"
echo "2. Generate app key: php artisan key:generate"
echo "3. Configure database in .env"
echo "4. Run migrations: php artisan migrate"
echo "5. Start server: php artisan serve"
