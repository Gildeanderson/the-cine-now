<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/825fe6c2-f692-42ec-918e-2693860104c3

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app (Web):
   `npm run dev`

## Mobile App (Expo)

Find the Expo project in the `/mobile` directory.

1. Install mobile dependencies:
   `cd mobile && npm install`
2. Run the mobile dev server:
   `npm run mobile:start`
