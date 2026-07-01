# StepCode // Heatmap Dashboard

A standalone, visually stunning, and highly responsive activity tracker dashboard designed with a premium, Apple-inspired glassmorphic interface. It seamlessly visualizes year-round GitHub code contributions and LeetCode solve records in a cohesive dashboard, eliminating AI template boxiness for a custom, bespoke design language.

## 🚀 Key Features

* **Apple Glassmorphism Design**: High-fidelity frosted panels utilizing backdrop-filter blurs, color saturation overlays, clean borders, and macOS-style inset top specular edge highlights.
* **Unified Card Headers**: Features a streamlined header layout inspired by modern visitor counter metrics—displaying massive activity sums, username tags, and minimalist action controls.
* **Accent Indicators**: Badges utilize a clean, dark translucent body with pure white typography, using colors (green/orange/red) strictly for functional status indicator dots and custom outline borders.
* **Zero-Delay Hover Engine**: Pure CSS-driven outline offset highlights and scale transitions on calendar cells, ensuring a 60fps, buttery-smooth interaction model.
* **Spacious Calendar Matrices**: Heatmaps feature larger `12px` rounded cells with generous spacing, styled with custom month and week columns.
* **Interactive Tooltips & Counters**: Translucent mouse-following hover tooltips and dynamic numeric count-up animations for statistics.
* **Offline Demo Mode Fallback**: Automatically falls back to high-fidelity mock engines if server endpoints are missing or Github credentials are not provided.

---

## 🛠️ Architecture & Tech Stack

* **Frontend**: React 18, TypeScript, Vite, Vanilla CSS custom properties (no Tailwind weight), and Framer Motion (for entrance transitions).
* **Backend**: FastAPI (Python), GitHub GraphQL API proxy, and LeetCode public API wrapper.

---

## 📦 Quick Start Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
* **Python** 3.9+
* **Node.js** 18+ (with npm)

### 2. Set Up Environment Variables
Create a `.env` file in the root directory (using `.env.example` as a template) and add your GitHub Personal Access Token (PAT):
```env
GITHUB_TOKEN=your_github_token_here
```
> **Note:** The token requires `read:user` and `repo` (or user contribution) scopes. You can generate a token in [GitHub Developer Settings](https://github.com/settings/tokens).

### 3. Running the FastAPI Backend
Open a terminal in the root project directory:
```powershell
# Install python dependencies
pip install -r requirements.txt

# Start the FastAPI server using Uvicorn
python -m uvicorn main:app --reload
```
The backend API starts running on **`http://localhost:8000`**.

### 4. Running the React Frontend
Open a new terminal in the `frontend` directory:
```powershell
# Install Node dependencies
npm install

# Start local Vite development server
npm run dev
```
Open **`http://localhost:5173`** in your browser to view the heatmap dashboard.

---

## 🎨 Theme Configuration
The application leverages StepCode's custom HSL color palette defined in `index.css`:
* **Charcoal Slate**: `#17191C` (Primary Background)
* **Off-White Cream**: `#E6E0D4` (Primary Text)
* **Crimson Red**: `#E63232` (Accents / Highlights)
* **GitHub Green**: `#39D353`
* **LeetCode Orange**: `#FFA116`
