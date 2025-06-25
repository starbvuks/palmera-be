# Swagger Documentation Publishing Guide

This guide provides step-by-step instructions for publishing your Swagger documentation live so you can share it with the frontend team.

## 🎯 Publishing Options

### Option 1: Swagger Hub (Recommended - Free)
**Best for**: Professional documentation with team collaboration

### Option 2: GitHub Pages (Free)
**Best for**: Simple hosting with version control

### Option 3: Netlify/Vercel (Free)
**Best for**: Custom domains and advanced features

### Option 4: AWS S3 + CloudFront (Paid)
**Best for**: Enterprise solutions with custom domains

---

## 🚀 Option 1: Swagger Hub (Recommended)

### Step 1: Create Swagger Hub Account
1. Go to [https://swagger.io/tools/swaggerhub/](https://swagger.io/tools/swaggerhub/)
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Create New API
1. Log in to Swagger Hub
2. Click "Create New" → "API"
3. Fill in the details:
   - **Name**: `Palmera Backend API`
   - **Version**: `1.0.0`
   - **Visibility**: `Public` (or `Private` for team-only)
   - **Description**: `Complete API documentation for Palmera backend microservices`

### Step 3: Upload Your Swagger File
1. In the API editor, click the "Import" button
2. Select "Import from File"
3. Upload your `swagger-unified.yaml` file
4. Click "Import"

### Step 4: Configure Settings
1. Go to "Settings" tab
2. Configure:
   - **Base URL**: Set to your production API gateway URL
   - **Schemes**: HTTPS
   - **Consumes**: application/json
   - **Produces**: application/json

### Step 5: Publish and Share
1. Click "Publish" to make it live
2. Copy the public URL (e.g., `https://app.swaggerhub.com/apis/your-username/palmera-backend-api/1.0.0`)
3. Share this URL with your frontend team

**Benefits**:
- ✅ Professional interface
- ✅ Team collaboration features
- ✅ Version control
- ✅ API testing interface
- ✅ Free for public APIs

---

## 🌐 Option 2: GitHub Pages

### Step 1: Create GitHub Repository
```bash
# Create a new repository on GitHub
# Name it: palmera-api-docs
```

### Step 2: Set Up Repository
```bash
# Clone the repository
git clone https://github.com/your-username/palmera-api-docs.git
cd palmera-api-docs

# Copy your Swagger file
cp ../palmera-be/swagger-unified.yaml ./swagger.yaml
```

### Step 3: Create HTML Page
Create `index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Palmera Backend API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: './swagger.yaml',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>
```

### Step 4: Deploy to GitHub Pages
```bash
# Add files
git add .

# Commit
git commit -m "Initial API documentation"

# Push
git push origin main

# Enable GitHub Pages
# Go to repository Settings → Pages
# Source: Deploy from a branch
# Branch: main
# Folder: / (root)
# Click Save
```

### Step 5: Access Your Documentation
Your documentation will be available at:
`https://your-username.github.io/palmera-api-docs/`

**Benefits**:
- ✅ Free hosting
- ✅ Version control
- ✅ Custom domain support
- ✅ Easy updates

---

## ⚡ Option 3: Netlify (Recommended for Custom Domains)

### Step 1: Create Netlify Account
1. Go to [https://netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Authorize Netlify access

### Step 2: Create Project Structure
```bash
# Create project directory
mkdir palmera-api-docs
cd palmera-api-docs

# Copy Swagger file
cp ../palmera-be/swagger-unified.yaml ./swagger.yaml

# Create the same index.html as GitHub Pages option
```

### Step 3: Deploy to Netlify
1. Go to Netlify dashboard
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: `.`
5. Click "Deploy site"

### Step 4: Custom Domain (Optional)
1. Go to "Domain settings"
2. Click "Add custom domain"
3. Enter your domain (e.g., `api.palmera.com`)
4. Configure DNS records as instructed

**Benefits**:
- ✅ Free hosting
- ✅ Custom domains
- ✅ Automatic deployments
- ✅ CDN
- ✅ SSL certificates

---

## ☁️ Option 4: AWS S3 + CloudFront (Enterprise)

### Step 1: Create S3 Bucket
```bash
# Create bucket
aws s3 mb s3://palmera-api-docs

# Enable static website hosting
aws s3 website s3://palmera-api-docs --index-document index.html
```

### Step 2: Upload Files
```bash
# Create the same files as GitHub Pages option
# Upload to S3
aws s3 sync . s3://palmera-api-docs --acl public-read
```

### Step 3: Create CloudFront Distribution
1. Go to AWS CloudFront console
2. Create distribution
3. Origin: Your S3 bucket
4. Configure custom domain and SSL certificate

**Benefits**:
- ✅ Enterprise-grade hosting
- ✅ Global CDN
- ✅ Custom domains
- ✅ Advanced security

---

## 🔧 Quick Setup Script

Create a deployment script to automate the process:

```bash
#!/bin/bash
# deploy-docs.sh

echo "🚀 Deploying Palmera API Documentation..."

# Create temporary directory
mkdir -p temp-docs
cd temp-docs

# Copy Swagger file
cp ../swagger-unified.yaml ./swagger.yaml

# Create HTML file
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Palmera Backend API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: './swagger.yaml',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
                plugins: [SwaggerUIBundle.plugins.DownloadUrl],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>
EOF

echo "✅ Documentation files created"
echo "📁 Files ready for deployment:"
ls -la

echo ""
echo "🎯 Next steps:"
echo "1. Upload these files to your chosen hosting platform"
echo "2. Share the URL with your frontend team"
echo "3. Update the URL in your project documentation"

cd ..
rm -rf temp-docs
```

Make it executable:
```bash
chmod +x deploy-docs.sh
./deploy-docs.sh
```

---

## 📋 Publishing Checklist

### Before Publishing
- [ ] Validate Swagger YAML syntax
- [ ] Test all endpoints in Swagger UI
- [ ] Verify authentication requirements
- [ ] Check all examples work
- [ ] Update server URLs to production

### After Publishing
- [ ] Test the live documentation
- [ ] Verify all endpoints are accessible
- [ ] Test authentication flow
- [ ] Share URL with frontend team
- [ ] Add URL to project documentation

### Maintenance
- [ ] Set up automatic updates
- [ ] Monitor documentation usage
- [ ] Update when API changes
- [ ] Keep examples current

---

## 🔗 Recommended URLs for Frontend Team

### Swagger Hub
```
https://app.swaggerhub.com/apis/your-username/palmera-backend-api/1.0.0
```

### GitHub Pages
```
https://your-username.github.io/palmera-api-docs/
```

### Netlify
```
https://palmera-api-docs.netlify.app/
```

### Custom Domain
```
https://api.palmera.com/docs/
```

---

## 📞 Support

### Common Issues

1. **CORS Errors**
   - Ensure your API endpoints allow requests from the documentation domain
   - Add documentation domain to allowed origins

2. **Authentication Issues**
   - Test with valid JWT tokens
   - Verify token format and expiration

3. **File Upload Issues**
   - Test with actual files
   - Check file size limits

4. **Schema Validation Errors**
   - Use online YAML validators
   - Check for syntax errors

### Getting Help

1. **Swagger Hub**: Use their support documentation
2. **GitHub Pages**: Check GitHub Pages documentation
3. **Netlify**: Use Netlify support and community
4. **AWS**: Use AWS documentation and support

---

## 🎉 Success!

Once published, your frontend team will have:
- ✅ Interactive API documentation
- ✅ Live endpoint testing
- ✅ Request/response examples
- ✅ Authentication testing
- ✅ Schema validation
- ✅ Professional interface

Share the URL with your frontend team and they can start integrating immediately! 