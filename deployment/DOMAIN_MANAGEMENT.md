# Domain Management Guide

This guide explains how to manage domain configuration for the Adventy application, including DNS setup, domain verification, and troubleshooting.

## Table of Contents

- [Overview](#overview)
- [Current Domain Configuration](#current-domain-configuration)
- [DNS Configuration](#dns-configuration)
- [Domain Verification](#domain-verification)
- [Updating Domain Configuration](#updating-domain-configuration)
- [Multiple Domains](#multiple-domains)
- [Subdomain Configuration](#subdomain-configuration)
- [Troubleshooting](#troubleshooting)

## Overview

The Adventy application is configured to work with domain names. This allows you to access the application using a friendly domain name instead of just an IP address.

**Current Domain:** `adventy.ru`

## Current Domain Configuration

The application is configured to accept requests from:
- **Primary Domain:** `adventy.ru`
- **IP Address:** Also accepts requests by IP address (via `_` in server_name)

### Nginx Configuration

The domain is configured in `/etc/nginx/sites-available/adventy`:

```nginx
server_name adventy.ru _;
```

The `_` allows the server to accept requests by IP address as well as the domain name.

## DNS Configuration

For the domain to work, DNS records must be properly configured to point to your server.

### Required DNS Records

#### A Record (IPv4)

Create an A record pointing your domain to your server's IP address:

```
Type: A
Name: @ (or leave blank for root domain)
Value: YOUR_SERVER_IP
TTL: 3600 (or your preference)
```

**Example:**
```
Type: A
Name: @
Value: 81.17.154.37
TTL: 3600
```

#### AAAA Record (IPv6) - Optional

If your server has an IPv6 address:

```
Type: AAAA
Name: @ (or leave blank for root domain)
Value: YOUR_SERVER_IPv6
TTL: 3600
```

### DNS Propagation

After creating DNS records:
1. **Wait for propagation** - DNS changes can take 5 minutes to 48 hours
2. **Check DNS propagation** - Use tools like:
   - https://dnschecker.org/
   - https://www.whatsmydns.net/
   - `dig adventy.ru` (from command line)
   - `nslookup adventy.ru` (from command line)

### Verify DNS Configuration

```bash
# Check A record
dig +short adventy.ru A

# Check all records
dig adventy.ru ANY

# Check from different locations
nslookup adventy.ru 8.8.8.8
```

The output should show your server's IP address.

## Domain Verification

### Test Domain Access

1. **HTTP Access:**
```bash
curl -I http://adventy.ru
```

2. **HTTPS Access (if SSL configured):**
```bash
curl -I https://adventy.ru
```

3. **From Browser:**
   - Open `http://adventy.ru` in your browser
   - Should load the Adventy application

### Check Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/adventy_access.log

# Error logs
sudo tail -f /var/log/nginx/adventy_error.log
```

Look for requests with your domain name in the Host header.

## Updating Domain Configuration

If you need to change the domain name:

### Step 1: Update DNS Records

Update your DNS provider to point the new domain to your server's IP address.

### Step 2: Update Nginx Configuration

Edit `/etc/nginx/sites-available/adventy`:

```bash
sudo nano /etc/nginx/sites-available/adventy
```

Update the `server_name` directive:

```nginx
# Old
server_name adventy.ru _;

# New
server_name yournewdomain.com www.yournewdomain.com _;
```

### Step 3: Update SSL Certificate (if using HTTPS)

If you have an SSL certificate, you'll need to obtain a new one for the new domain:

```bash
# Remove old certificate (optional)
sudo certbot delete --cert-name adventy.ru

# Obtain new certificate
sudo certbot --nginx -d yournewdomain.com -d www.yournewdomain.com
```

### Step 4: Test and Reload

```bash
# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 5: Update Documentation

Update any documentation that references the old domain name.

## Multiple Domains

You can configure nginx to accept multiple domains:

### Configuration

Edit `/etc/nginx/sites-available/adventy`:

```nginx
server_name adventy.ru example.com www.example.com _;
```

### SSL Certificates for Multiple Domains

For Let's Encrypt, include all domains:

```bash
sudo certbot --nginx -d adventy.ru -d example.com -d www.example.com
```

This creates a single certificate covering all domains.

## Subdomain Configuration

To add a subdomain (e.g., `api.adventy.ru`):

### Step 1: Create DNS Record

Add an A record for the subdomain:

```
Type: A
Name: api
Value: YOUR_SERVER_IP
TTL: 3600
```

### Step 2: Create Separate Nginx Configuration (Optional)

For a different configuration (e.g., API-only subdomain):

```bash
sudo cp /etc/nginx/sites-available/adventy /etc/nginx/sites-available/adventy-api
sudo nano /etc/nginx/sites-available/adventy-api
```

Update server_name:
```nginx
server_name api.adventy.ru;
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/adventy-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Step 3: SSL Certificate for Subdomain

```bash
sudo certbot --nginx -d api.adventy.ru
```

## Troubleshooting

### Domain Not Resolving

**Problem:** Domain doesn't resolve to your server IP

**Check:**
```bash
# Check DNS resolution
dig adventy.ru

# Check from different DNS servers
nslookup adventy.ru 8.8.8.8
nslookup adventy.ru 1.1.1.1
```

**Solutions:**
- Verify DNS records are correct in your DNS provider
- Wait for DNS propagation (can take up to 48 hours)
- Check TTL value (lower TTL = faster updates)
- Clear local DNS cache: `sudo systemd-resolve --flush-caches` (Linux) or `ipconfig /flushdns` (Windows)

### Domain Resolves but Site Doesn't Load

**Problem:** DNS works but browser shows error

**Check:**
```bash
# Test HTTP connection
curl -v http://adventy.ru

# Check nginx is running
sudo systemctl status nginx

# Check nginx configuration
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
```

**Solutions:**
- Verify nginx is running
- Check firewall allows ports 80 and 443
- Verify server_name matches domain
- Check application is running: `sudo systemctl status adventy.service`

### Wrong Site Loads

**Problem:** Domain loads but shows wrong content

**Check:**
```bash
# Check which nginx site is handling the request
sudo nginx -T | grep -A 5 "server_name.*adventy"

# Check for conflicting configurations
ls -la /etc/nginx/sites-enabled/
```

**Solutions:**
- Ensure only one site configuration handles your domain
- Remove or disable conflicting sites
- Check default site isn't interfering

### SSL Certificate Domain Mismatch

**Problem:** SSL certificate doesn't match domain

**Check:**
```bash
# Check certificate domain
echo | openssl s_client -servername adventy.ru -connect adventy.ru:443 2>/dev/null | openssl x509 -noout -subject
```

**Solutions:**
- Obtain certificate for correct domain: `sudo certbot --nginx -d adventy.ru`
- Update nginx configuration with correct certificate paths
- Reload nginx after changes

### Domain Works but IP Doesn't

**Problem:** Domain works but accessing by IP shows error

This is normal if you remove `_` from server_name. To allow both:

```nginx
server_name adventy.ru _;
```

The `_` is a catch-all that allows requests by IP address.

## Best Practices

1. **Use A Records** - Prefer A records over CNAME for root domains
2. **Set Appropriate TTL** - Use 3600 (1 hour) for flexibility, 86400 (24 hours) for stability
3. **Monitor DNS Propagation** - Use DNS checker tools before making changes
4. **Document DNS Changes** - Keep track of DNS record changes
5. **Test Before Production** - Test domain changes in staging first
6. **Keep DNS Provider Credentials Secure** - Use strong passwords and 2FA
7. **Regular DNS Audits** - Periodically verify DNS records are correct

## DNS Provider Guides

Common DNS providers and how to add A records:

### Cloudflare
1. Log in to Cloudflare
2. Select your domain
3. Go to DNS → Records
4. Add A record: Name `@` or subdomain, IPv4 address, TTL

### GoDaddy
1. Log in to GoDaddy
2. Go to My Products → DNS
3. Add A record: Host `@`, Points to (IP), TTL

### Namecheap
1. Log in to Namecheap
2. Domain List → Manage → Advanced DNS
3. Add A record: Host `@`, Value (IP), TTL

### AWS Route 53
1. AWS Console → Route 53 → Hosted Zones
2. Select domain → Create Record
3. Record type A, Value (IP), TTL

## Quick Reference

```bash
# Check DNS resolution
dig adventy.ru
nslookup adventy.ru

# Test domain access
curl -I http://adventy.ru
curl -I https://adventy.ru

# Check nginx configuration
sudo nginx -t
sudo nginx -T | grep server_name

# View nginx logs
sudo tail -f /var/log/nginx/adventy_access.log
sudo tail -f /var/log/nginx/adventy_error.log

# Update domain in nginx
sudo nano /etc/nginx/sites-available/adventy
sudo nginx -t && sudo systemctl reload nginx

# Get SSL certificate for domain
sudo certbot --nginx -d adventy.ru
```

## Additional Resources

- [DNS Propagation Checker](https://dnschecker.org/)
- [What's My DNS](https://www.whatsmydns.net/)
- [Nginx Server Name Documentation](https://nginx.org/en/docs/http/server_names.html)
- [Let's Encrypt Domain Validation](https://letsencrypt.org/docs/challenge-types/)
