# 💕 My Romantic Message Website

A beautiful, romantic static website where you can upload photos and write personal romantic messages.

## 🚀 Free Hosting Options

### Option 1: GitHub Pages (Recommended - Easiest)

1. **Create a GitHub account** (if you don't have one): https://github.com
2. **Create a new repository** on GitHub
3. **Upload your files** to the repository:
   - `index.html`
   - `style.css`
   - `script.js`
4. **Enable GitHub Pages**:
   - Go to your repository → Settings → Pages
   - Under "Source", select "main" branch (or "master")
   - Click Save
   - Your site will be live at: `https://yourusername.github.io/repository-name`

### Option 2: Netlify (Drag & Drop)

1. Go to https://www.netlify.com
2. Sign up for free
3. Drag and drop your entire project folder onto Netlify
4. Your site will be live instantly with a free `.netlify.app` URL

### Option 3: Vercel

1. Go to https://vercel.com
2. Sign up for free
3. Import your project (connect GitHub or upload)
4. Deploy instantly

## 🌐 Custom Domain Setup

### Free Subdomains (Included with Hosting)

All hosting providers give you a **free subdomain**:
- **GitHub Pages**: `yoursite.github.io`
- **Netlify**: `yoursite.netlify.app`
- **Vercel**: `yoursite.vercel.app`

### Custom Domain Options

**Option 1: Use Your Own Domain (Recommended)**
- **Cost**: ~$10-15/year for a domain (e.g., from Namecheap, Google Domains, Cloudflare)
- **Free hosting**: All providers above allow you to connect your own domain for FREE
- **Steps**:
  1. Buy a domain (e.g., `yourromanticmessage.com`)
  2. In your hosting provider's settings, add your custom domain
  3. Update DNS records (they'll give you instructions)
  4. Your site will be live at your custom domain!

**Option 2: Free Domain Services (Not Recommended)**
- Services like **Freenom** used to offer free `.tk`, `.ml`, `.ga` domains
- ⚠️ **Not reliable** - domains can be revoked, poor reputation, often blocked
- Better to use free subdomains from reliable providers

**Option 3: Free Subdomain from Domain Providers**
- Some services offer free subdomains (e.g., `yoursite.freehosting.com`)
- Usually comes with limitations and ads
- Better to use hosting provider subdomains

### Best Approach:
1. **Start with free subdomain** (e.g., `yourromanticmessage.netlify.app`)
2. **If you want a custom domain later**, buy one and connect it (hosting stays free!)

**Example**: You can have `romanticlove.netlify.app` for free, then later add `romanticlove.com` if you buy the domain.

## 📸 About Photo Storage

**Current Setup:**
- Photos are stored in the browser's **localStorage**
- They are **NOT uploaded to any server**
- Photos are only saved on the user's device
- They are **not shareable** between devices
- Photos are lost if browser data is cleared

**If you want photos to be stored in the cloud:**
- We can integrate free services like:
  - **Firebase Storage** (Google - free tier available)
  - **Cloudinary** (free tier available)
  - **ImgBB** (free image hosting API)
  - **Supabase Storage** (free tier available)

This would allow photos to be:
- ✅ Stored in the cloud
- ✅ Shareable via URL
- ✅ Accessible from any device
- ✅ Persistent (won't be lost)

Would you like me to add cloud photo storage? Just let me know!

## 📁 Files

- `index.html` - Main HTML structure
- `style.css` - Beautiful romantic styling
- `script.js` - Functionality for photo upload and messages

## 💻 Local Development

Just open `index.html` in your browser - no server needed!

