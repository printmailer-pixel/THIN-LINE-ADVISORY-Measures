# THIN LINE ADVISORY Measures

A confidential assessment tool designed for first responders to evaluate their nervous system elasticity, CAPE load, PCL-5 symptoms, and general mood/anxiety levels.

This application is entirely self-contained and runs purely in the client's web browser. It does **not** rely on any AI APIs (like OpenAI GPT or Google Gemini) and requires no such API keys or tokens. No external backend is required except for an optional Google Apps Script hook you can connect to.

## Features
- **Clean Minimalism**: A polished, responsive, and privacy-focused UI designed with Tailwind CSS.
- **Client-Side Processing**: No servers are needed for evaluating scores.
- **Automated GitHub Pages Deployment**: Automatically deploys the latest version to GitHub Pages on every push.

## Local Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

## Deployment

A GitHub Actions workflow is included (`.github/workflows/deploy.yml`). Whenever you push changes to the `main` or `master` branch, the workflow will automatically build the site and deploy it to GitHub Pages.

**Note:** Ensure you have enabled GitHub Pages in your repository settings and selected "GitHub Actions" as the source.
