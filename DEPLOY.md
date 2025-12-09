# Deployment Guide

This guide covers deploying the photography portfolio to Vercel with custom domains registered on Porkbun.

## Prerequisites

- GitHub repository with code pushed (including Git LFS for photos)
- Vercel account (free tier works, but Pro recommended for analytics)
- Domains registered on Porkbun:
  - `shaneorr.me` (primary domain)
  - `shaneorr.io` (redirects to primary)

## 1. Verify Git LFS Setup

Before deploying, ensure Git LFS is properly configured:

```bash
# Check LFS is tracking files
git lfs ls-files

# Verify .gitattributes includes image patterns
cat .gitattributes
```

All photos in `src/photography/` should be tracked by LFS.

## 2. Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Select the `personal-blog` repository
4. Vercel auto-detects Astro and configures build settings

### Build Settings (auto-detected)

| Setting | Value |
|---------|-------|
| Framework Preset | Astro |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

5. Click **Deploy**

Vercel automatically:
- Installs dependencies
- Pulls Git LFS files
- Runs the Astro build
- Deploys to a `.vercel.app` subdomain

## 3. Add Primary Domain (shaneorr.me)

### In Vercel

1. Go to your project → **Settings** → **Domains**
2. Enter `shaneorr.me` and click **Add**
3. Also add `www.shaneorr.me`
4. Vercel displays the required DNS records

### In Porkbun

1. Log in to [porkbun.com](https://porkbun.com)
2. Go to **Domain Management** → `shaneorr.me` → **DNS**
3. Delete any existing A or CNAME records for `@` and `www`
4. Add the following records:

| Type | Host | Answer | TTL |
|------|------|--------|-----|
| A | (blank for root) | `76.76.21.21` | 600 |
| CNAME | www | `cname.vercel-dns.com` | 600 |

**Note:** Vercel's A record IP is `76.76.21.21`. The CNAME for www points to `cname.vercel-dns.com`.

5. Wait for DNS propagation (usually 5-30 minutes)

### Verify in Vercel

Once DNS propagates, Vercel shows a green checkmark next to the domain. SSL certificates are automatically provisioned.

## 4. Add Redirect Domain (shaneorr.io)

### In Vercel

1. Go to your project → **Settings** → **Domains**
2. Enter `shaneorr.io` and click **Add**
3. Select **Redirect to shaneorr.me** (308 permanent redirect)
4. Also add `www.shaneorr.io` with the same redirect

### In Porkbun

1. Go to **Domain Management** → `shaneorr.io` → **DNS**
2. Delete any existing A or CNAME records for `@` and `www`
3. Add the following records:

| Type | Host | Answer | TTL |
|------|------|--------|-----|
| A | (blank for root) | `76.76.21.21` | 600 |
| CNAME | www | `cname.vercel-dns.com` | 600 |

The DNS records are identical to the primary domain. Vercel handles the redirect at the application level.

## 5. SSL/HTTPS

Vercel automatically:
- Provisions SSL certificates via Let's Encrypt
- Renews certificates before expiration
- Redirects HTTP to HTTPS

No configuration required.

## 6. Git LFS Bandwidth

Each Vercel deployment downloads all LFS files from GitHub. With 100+ photos (~15GB), bandwidth adds up quickly.

### GitHub LFS Limits

| Plan | Storage | Bandwidth/month |
|------|---------|-----------------|
| Free | 1 GB | 1 GB |
| Data Pack ($5/mo) | +50 GB | +50 GB |
| Team ($4/user/mo) | 250 GB | 250 GB |

**Recommendation:** Purchase a GitHub Data Pack or upgrade to Team plan to avoid overage charges ($0.07/GB).

### Monitor Usage

Check LFS bandwidth in GitHub:
1. Go to **Settings** → **Billing and plans**
2. View **Git LFS Data** usage

## 7. Deployment Workflow

### Automatic Deployments

Every push to `main` triggers a new deployment:

```bash
git add .
git commit -m "Update content"
git push
```

Vercel builds and deploys automatically. View deployment status in the Vercel dashboard.

### Preview Deployments

Pull requests get unique preview URLs:
- `your-branch.your-project.vercel.app`

Useful for reviewing changes before merging.

### Manual Deployments

Trigger a rebuild from the Vercel dashboard:
1. Go to your project → **Deployments**
2. Click the three dots on the latest deployment
3. Select **Redeploy**

## 8. Environment Variables (if needed)

If you add features requiring secrets:

1. Go to project **Settings** → **Environment Variables**
2. Add variables for Production, Preview, or Development
3. Redeploy for changes to take effect

Currently, no environment variables are required.

## 9. Domain Configuration Summary

| Domain | Purpose | DNS Provider |
|--------|---------|--------------|
| `shaneorr.me` | Primary site | Porkbun |
| `www.shaneorr.me` | Redirects to apex | Porkbun |
| `shaneorr.io` | Redirects to primary | Porkbun |
| `www.shaneorr.io` | Redirects to primary | Porkbun |
| `*.vercel.app` | Vercel subdomain (backup) | Vercel |

## Troubleshooting

### DNS Not Propagating

- Use [dnschecker.org](https://dnschecker.org) to verify DNS records
- Clear browser cache or try incognito mode
- Wait up to 48 hours for full propagation (usually much faster)

### Build Failures

1. Check Vercel deployment logs for errors
2. Verify `npm run build` works locally
3. Ensure all dependencies are in `package.json`

### LFS Files Not Downloading

1. Verify `.gitattributes` is committed
2. Check GitHub LFS bandwidth hasn't exceeded quota
3. Run `git lfs fetch --all` locally to verify files

### SSL Certificate Issues

- Ensure DNS records point to Vercel (not Porkbun parking page)
- Wait for DNS propagation before SSL provisioning
- Check Vercel domain settings for certificate status
