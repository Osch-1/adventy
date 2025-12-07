# SSL Certificate Management Guide

This guide explains how to work with SSL certificates for the Adventy application, including obtaining, installing, and managing certificates for secure HTTPS connections.

## Table of Contents

- [Overview](#overview)
- [Certificate Types](#certificate-types)
- [Let's Encrypt (Recommended)](#lets-encrypt-recommended)
- [Self-Signed Certificates](#self-signed-certificates)
- [Commercial Certificates](#commercial-certificates)
- [Certificate Renewal](#certificate-renewal)
- [Troubleshooting](#troubleshooting)

## Overview

SSL (Secure Sockets Layer) certificates enable HTTPS encryption for your web application. They ensure that data transmitted between clients and your server is encrypted and authenticated.

**Current Domain:** `2966415-bp32333.twc1.net`

## Certificate Types

### 1. Let's Encrypt (Free, Recommended)
- **Cost:** Free
- **Validity:** 90 days (auto-renewable)
- **Trust:** Trusted by all major browsers
- **Best for:** Production environments
- **Requirements:** Domain must be publicly accessible and point to your server

### 2. Self-Signed Certificates
- **Cost:** Free
- **Validity:** Custom (typically 1 year)
- **Trust:** Not trusted by browsers (shows security warning)
- **Best for:** Development, testing, internal networks
- **Requirements:** None (can be generated locally)

### 3. Commercial Certificates
- **Cost:** Varies ($50-$500+ per year)
- **Validity:** 1-3 years
- **Trust:** Trusted by all browsers
- **Best for:** Enterprise environments with specific requirements
- **Requirements:** Purchase from certificate authority

## Let's Encrypt (Recommended)

Let's Encrypt provides free, automated SSL certificates that are trusted by all major browsers.

### Prerequisites

1. Domain must point to your server's IP address
2. Port 80 must be accessible (for HTTP-01 challenge)
3. Nginx must be installed and running

### Installation

#### Step 1: Install Certbot

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

#### Step 2: Obtain Certificate

For your domain `2966415-bp32333.twc1.net`:

```bash
sudo certbot --nginx -d 2966415-bp32333.twc1.net
```

Certbot will:
- Automatically obtain a certificate
- Update your nginx configuration
- Set up automatic renewal
- Configure HTTP to HTTPS redirect (optional)

#### Step 3: Verify Installation

```bash
# Check certificate status
sudo certbot certificates

# Test HTTPS connection
curl -I https://2966415-bp32333.twc1.net
```

#### Step 4: Test Auto-Renewal

Let's Encrypt certificates expire after 90 days. Certbot sets up automatic renewal, but you should test it:

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run
```

### Certificate Locations

Let's Encrypt certificates are stored at:
```
/etc/letsencrypt/live/2966415-bp32333.twc1.net/
├── fullchain.pem    # Certificate + chain (use this for nginx)
├── privkey.pem      # Private key (use this for nginx)
├── cert.pem         # Certificate only
└── chain.pem        # Certificate chain only
```

### Nginx Configuration

After running certbot, your nginx configuration will be automatically updated. The HTTPS server block will be uncommented and configured with:

```nginx
ssl_certificate /etc/letsencrypt/live/2966415-bp32333.twc1.net/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/2966415-bp32333.twc1.net/privkey.pem;
```

### Automatic Renewal

Certbot creates a systemd timer for automatic renewal. Check status:

```bash
# Check renewal timer
sudo systemctl status certbot.timer

# View renewal logs
sudo journalctl -u certbot.timer
```

Renewal happens automatically, but you can manually renew:

```bash
# Renew all certificates
sudo certbot renew

# Renew specific certificate
sudo certbot renew --cert-name 2966415-bp32333.twc1.net
```

After renewal, nginx must be reloaded. Certbot handles this automatically via a renewal hook.

## Self-Signed Certificates

Self-signed certificates are useful for development and testing but will show security warnings in browsers.

### Generate Self-Signed Certificate

```bash
# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Generate certificate (valid for 1 year)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/2966415-bp32333.twc1.net.key \
  -out /etc/nginx/ssl/2966415-bp32333.twc1.net.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=2966415-bp32333.twc1.net"

# Set proper permissions
sudo chmod 600 /etc/nginx/ssl/2966415-bp32333.twc1.net.key
sudo chmod 644 /etc/nginx/ssl/2966415-bp32333.twc1.net.crt
```

### Configure Nginx

Edit `/etc/nginx/sites-available/adventy` and uncomment the HTTPS server block, then update:

```nginx
ssl_certificate /etc/nginx/ssl/2966415-bp32333.twc1.net.crt;
ssl_certificate_key /etc/nginx/ssl/2966415-bp32333.twc1.net.key;
```

Then test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Certificate Details

View certificate information:

```bash
# View certificate details
openssl x509 -in /etc/nginx/ssl/2966415-bp32333.twc1.net.crt -text -noout

# Check expiration date
openssl x509 -in /etc/nginx/ssl/2966415-bp32333.twc1.net.crt -noout -enddate
```

## Commercial Certificates

If you purchase a certificate from a commercial CA (e.g., DigiCert, GlobalSign, Sectigo):

### Installation Steps

1. **Purchase certificate** from your chosen CA
2. **Generate Certificate Signing Request (CSR)**:

```bash
sudo openssl req -new -newkey rsa:2048 -nodes \
  -keyout /etc/nginx/ssl/2966415-bp32333.twc1.net.key \
  -out /etc/nginx/ssl/2966415-bp32333.twc1.net.csr \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=2966415-bp32333.twc1.net"
```

3. **Submit CSR** to your CA (they'll provide certificate files)
4. **Install certificate files** provided by CA
5. **Configure nginx** with certificate paths
6. **Test and reload nginx**

## Certificate Renewal

### Let's Encrypt Renewal

Automatic renewal is configured by certbot. Manual renewal:

```bash
# Renew all certificates
sudo certbot renew

# Force renewal (even if not expired)
sudo certbot renew --force-renewal
```

### Self-Signed Certificate Renewal

Generate a new certificate before expiration:

```bash
# Backup old certificate
sudo cp /etc/nginx/ssl/2966415-bp32333.twc1.net.crt /etc/nginx/ssl/2966415-bp32333.twc1.net.crt.backup
sudo cp /etc/nginx/ssl/2966415-bp32333.twc1.net.key /etc/nginx/ssl/2966415-bp32333.twc1.net.key.backup

# Generate new certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/2966415-bp32333.twc1.net.key \
  -out /etc/nginx/ssl/2966415-bp32333.twc1.net.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=2966415-bp32333.twc1.net"

# Reload nginx
sudo nginx -t && sudo systemctl reload nginx
```

### Check Certificate Expiration

```bash
# Let's Encrypt certificate
sudo certbot certificates

# Self-signed certificate
openssl x509 -in /etc/nginx/ssl/2966415-bp32333.twc1.net.crt -noout -enddate

# Check via HTTPS
echo | openssl s_client -servername 2966415-bp32333.twc1.net -connect 2966415-bp32333.twc1.net:443 2>/dev/null | openssl x509 -noout -enddate
```

## Troubleshooting

### Certificate Not Trusted

**Problem:** Browser shows "Not Secure" or certificate warning

**Solutions:**
- For Let's Encrypt: Ensure domain DNS points to your server
- For self-signed: This is expected; accept the warning or use Let's Encrypt
- Check certificate is properly installed: `sudo certbot certificates`

### Certificate Expired

**Problem:** Certificate has expired

**Solutions:**
- Let's Encrypt: Run `sudo certbot renew`
- Self-signed: Generate new certificate (see renewal section)
- Check expiration: `openssl x509 -in /path/to/cert.pem -noout -enddate`

### Nginx SSL Errors

**Problem:** Nginx fails to start or shows SSL errors

**Check:**
```bash
# Test nginx configuration
sudo nginx -t

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify certificate files exist
sudo ls -la /etc/letsencrypt/live/2966415-bp32333.twc1.net/
```

**Common issues:**
- Certificate file paths incorrect
- Certificate file permissions wrong (should be readable by nginx)
- Certificate doesn't match domain name

### Certbot Renewal Fails

**Problem:** Automatic renewal not working

**Check:**
```bash
# Check certbot timer status
sudo systemctl status certbot.timer

# Test renewal manually
sudo certbot renew --dry-run

# Check renewal logs
sudo journalctl -u certbot.timer -n 50
```

**Solutions:**
- Ensure port 80 is accessible (for HTTP-01 challenge)
- Check DNS still points to your server
- Verify nginx is running
- Check firewall rules

### Mixed Content Warnings

**Problem:** Browser shows mixed content warnings (HTTP resources on HTTPS page)

**Solutions:**
- Ensure all API calls use HTTPS
- Update frontend to use relative URLs or HTTPS URLs
- Check nginx redirects HTTP to HTTPS

### Certificate Chain Issues

**Problem:** Some browsers show certificate errors

**Solutions:**
- Ensure `fullchain.pem` is used (not just `cert.pem`)
- Verify intermediate certificates are included
- Test with SSL Labs: https://www.ssllabs.com/ssltest/

## Best Practices

1. **Use Let's Encrypt for production** - Free, trusted, auto-renewable
2. **Monitor certificate expiration** - Set up alerts for 30 days before expiration
3. **Test renewal regularly** - Run `certbot renew --dry-run` monthly
4. **Backup certificates** - Keep backups of private keys (securely stored)
5. **Use strong ciphers** - Nginx config includes modern TLS settings
6. **Enable HSTS** - Already configured in nginx (Strict-Transport-Security header)
7. **Keep certbot updated** - `sudo apt-get update && sudo apt-get upgrade certbot`

## Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot Documentation](https://eff-certbot.readthedocs.io/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/) - Test your SSL configuration

## Quick Reference

```bash
# Install Let's Encrypt certificate
sudo certbot --nginx -d 2966415-bp32333.twc1.net

# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# View certificate expiration
echo | openssl s_client -servername 2966415-bp32333.twc1.net -connect 2966415-bp32333.twc1.net:443 2>/dev/null | openssl x509 -noout -enddate

# Test HTTPS connection
curl -I https://2966415-bp32333.twc1.net
```
