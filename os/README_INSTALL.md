# Voice OS - Backend Setup

This directory contains the Python backend for Voice OS.

## Setup Instructions

1. **Install Python Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up API Key:**
   Create a `.env` file in this directory with:
   ```
   GOOGLE_API_KEY='your_api_key_here'
   ```

3. **Run Setup:**
   ```bash
   voice-os-ai setup
   ```

## Directory Structure

- `operate/` - Core automation modules
- `requirements.txt` - Python dependencies
- `.env` - API key configuration (created during setup)

## Getting API Key

1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Run: `voice-os-ai setup` to configure

## Support

For issues, visit: https://github.com/anshiakhileshmj/fantastic-engine/issues 