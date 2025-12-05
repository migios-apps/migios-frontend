# Deployment Guide for Migios Frontend (Coolify)

## Prerequisites

- Coolify instance set up
- Backend API URL configured

## Deployment Steps

### 1. Configure Build Environment

The frontend uses Vite with different build modes:

- `build:prod` - Production build (default in Dockerfile)
- `build:staging` - Staging build
- `build:dev` - Development build

To change the build mode, edit the Dockerfile and replace:

```dockerfile
RUN npm run build:prod
```

with your desired build mode.

### 2. Environment Variables

Configure environment variables in Coolify or create `.env` file:

```env
NODE_ENV=production
VITE_PUBLIC_API_URL_V1=https://your-api-url.com
VITE_APP_CLIENT_ID=your-client-id
VITE_APP_CLIENT_SECRET=your-client-secret
VITE_BASENAME=  # Optional, for subdirectory deployment
```

**Note**:

- Vite environment variables must be prefixed with `VITE_` to be accessible in the browser.
- These variables are used at **build time** (not runtime), so they must be set as build arguments in docker-compose.yml.
- In Coolify, set these as environment variables and they will be automatically passed as build arguments.

### 3. Deploy in Coolify

1. **Create New Resource** in Coolify
2. **Select "Docker Compose"** as deployment type
3. **Connect your Git repository** or upload the project
4. **Set the root directory** to `migios-shadcn`
5. **Coolify will automatically detect** `docker-compose.yml`
6. **Configure environment variables** in Coolify dashboard
7. **Deploy**

### 4. Static Build

The application is built as a static site and served via Nginx. The build output is in the `dist` directory.

### 5. Nginx Configuration

The `nginx.conf` file includes:

- SPA routing support (all routes redirect to index.html)
- Gzip compression
- Static asset caching
- Security headers
- Health check endpoint at `/health`

### 6. Custom Domain

In Coolify, you can configure:

- Custom domain
- SSL certificate (automatic via Let's Encrypt)
- Reverse proxy settings

## Customization

### Change Build Mode

Edit `Dockerfile`:

```dockerfile
# For staging
RUN npm run build:staging

# For development
RUN npm run build:dev
```

### Modify Nginx Config

Edit `nginx.conf` to customize:

- Server name
- Cache settings
- Security headers
- Additional routes

### Port Configuration

Default port is 5737. Change in `docker-compose.yml`:

```yaml
ports:
  - "${PORT:-5737}:5737"
```

## Troubleshooting

- **Build fails**: Check Node.js version compatibility
- **404 on routes**: Ensure nginx.conf has SPA routing configured
- **API not connecting**: Verify `VITE_PUBLIC_API_URL_V1` is set correctly as build argument
- **Static assets not loading**: Check nginx.conf cache settings

## Health Check

The application includes a health check endpoint at `/health` that returns "healthy" status.
