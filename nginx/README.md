# Nginx Configuration for Adventy

This folder contains the nginx configuration file for proxying requests to the Adventy .NET application.

## Files

- **`adventy.conf`** - Main nginx configuration file

## Installation

### 1. Copy Configuration File

```bash
sudo cp nginx/adventy.conf /etc/nginx/sites-available/adventy
```

### 2. Edit Configuration

Before enabling, edit the configuration file to match your setup:

```bash
sudo nano /etc/nginx/sites-available/adventy
```

**Important settings to update:**

- `server_name`:
  - If you have a domain: Replace `yourdomain.com` with your actual domain name
  - If using IP only: The `_` in server_name allows requests by IP address (already configured)
  - You can use both: `server_name yourdomain.com www.yourdomain.com _;`
- `root`: Update `/opt/adventy/wwwroot` if your deployment path is different
- `upstream server`: Update `localhost:5000` if your backend runs on a different port
- `ssl_certificate` and `ssl_certificate_key`: Configure SSL certificates for HTTPS (see SSL/HTTPS section)

### 3. Enable Site

Create a symbolic link to enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/adventy /etc/nginx/sites-enabled/
```

### 4. Remove Default Site (Optional)

If you want to remove the default nginx site:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 5. Test Configuration

Test the nginx configuration for syntax errors:

```bash
sudo nginx -t
```

### 6. Reload Nginx

If the test is successful, reload nginx:

```bash
sudo systemctl reload nginx
```

## SSL/HTTPS Configuration

The nginx configuration already includes HTTPS support on port 443. You just need to configure SSL certificates.

### Option 1: Let's Encrypt (Recommended for Production)

1. **Install Certbot**:

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

2. **Obtain SSL Certificate**:

For domain name:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will automatically update the nginx configuration with the certificate paths.

3. **Reload nginx**:

```bash
sudo systemctl reload nginx
```

### Option 2: Self-Signed Certificate (For Testing/Development)

If you want to test HTTPS with a self-signed certificate:

1. **Create SSL directory**:

```bash
sudo mkdir -p /etc/nginx/ssl
```

2. **Generate self-signed certificate**:

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/key.pem \
  -out /etc/nginx/ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=yourdomain.com"
```

3. **Update nginx configuration**:

Edit `/etc/nginx/sites-available/adventy` and update the HTTPS server block:

```nginx
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;
```

4. **Test and reload**:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Note:** Browsers will show a security warning for self-signed certificates. This is normal and expected.

### Option 3: Using IP Address with HTTPS

The configuration accepts HTTPS requests by IP address. However, SSL certificates are typically tied to domain names. For IP-based HTTPS:

1. Use a self-signed certificate (see Option 2)
2. Or use a wildcard certificate
3. Or access via HTTP (port 80) when using IP address

### HTTP to HTTPS Redirect

To automatically redirect HTTP to HTTPS, uncomment this line in the HTTP server block:

```nginx
return 301 https://$host$request_uri;
```

Then reload nginx.

## Configuration Details

### IP Address Access

The configuration accepts requests by IP address thanks to the `_` in `server_name`. This means you can access the application using:
- `http://YOUR_VM_IP` (HTTP)
- `https://YOUR_VM_IP` (HTTPS, requires SSL certificate)
- `http://yourdomain.com` (if domain is configured)
- `https://yourdomain.com` (if domain and SSL are configured)

### Upstream Backend

The configuration sets up an upstream server pointing to `localhost:5000` where the .NET application runs. This can be adjusted if your application runs on a different port.

### Static Files

Static files (React build output) are served directly by nginx from `/opt/adventy/wwwroot` for better performance.

### API Proxy

All requests to `/api/*` are proxied to the .NET backend with proper headers preserved, including:
- `X-Timezone` header (used by the API)
- Standard proxy headers for IP forwarding
- Connection keep-alive for better performance

### Caching

Static assets (JS, CSS, images, fonts) are cached for 1 year with immutable cache headers.

### Gzip Compression

Gzip compression is enabled for text-based files to reduce bandwidth usage.

### HTTPS Support

The configuration includes a complete HTTPS server block on port 443. Just configure SSL certificates to enable it. Both HTTP (port 80) and HTTPS (port 443) are configured and ready to use.

## Troubleshooting

### Check Nginx Status

```bash
sudo systemctl status nginx
```

### View Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/adventy_access.log

# Error logs
sudo tail -f /var/log/nginx/adventy_error.log
```

### Test Backend Connection

Make sure the .NET application is running:

```bash
curl http://localhost:5000/api/Adventures
```

### Reload After Changes

After making changes to the configuration:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Security Considerations

- **HTTPS**: Enable HTTPS in production with a valid SSL certificate (Let's Encrypt recommended)
- **Server Name**: The `_` in server_name allows IP access but may be less secure. For production with a domain, consider removing `_` and using only your domain name
- **Rate Limiting**: Consider enabling rate limiting (commented in config) to prevent abuse
- **Security Headers**: Review and adjust security headers as needed
- **Firewall**: Configure firewall to only allow ports 80 (HTTP) and 443 (HTTPS)
- **Updates**: Keep nginx updated: `sudo apt-get update && sudo apt-get upgrade nginx`

