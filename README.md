# 🛡️ ConsentIQ - Data Nutrition Label Intelligence

**Transforming complex privacy legalese into readable, student-friendly data nutrition labels.**

Built for the **AMD Slingshot Hackathon**, ConsentIQ is a privacy-first analysis tool that scans AI application policies, identifies high-risk data practices using local NLP, and generates a visual risk report—completely cost-free and autonomous.

![ConsentIQ Banner](./docs/assets/banner.png)

## 🚀 The Mission
Students often use AI tools without knowing how their data is handled. ConsentIQ solves this by providing a "Traffic Light" risk system, allowing users to understand:
- **Data Retention**: How long is your data kept?
- **Third-party Sharing**: Is your data sold to partners?
- **Biometric Usage**: Does the app collect face/voice data?
- **Targeted Advertising**: Is your activity used for marketing?
- **Data Deletion**: Can you actually remove your data?

## 🛠️ Tech Stack (100% Local & Cost-Free)
- **Frontend**: React.js, Tailwind CSS, Framer Motion (Glassmorphism UI).
- **Visuals**: Three.js & WebGL (High-performance animated background).
- **Backend**: Node.js/Express (Secure Intelligence Proxy).
- **AI Brain**: Python (FastAPI), Transformers (HuggingFace DistilBERT).
- **Stealth Scraper**: Playwright-Stealth (Bypasses bot-detection on Google/OpenAI).
- **Optimization**: AMD ROCm support for local GPU acceleration.

## ✨ Key Features

### 🕵️ Stealth Intelligence Scanner
Bypasses restrictive "anti-bot" measures on major domains like OpenAI, Google Workspace, and Instagram. Uses human-like behavior simulation and randomized browser fingerprints.

### 🧠 Chunked NLP Brain
Analyzes large documents (20,000+ words) by extracting strategic chunks from the start, middle, and end. Uses local "Zero-Shot" classification to assign scores without any paid API calls.

### 📊 Intelligence Dashboard
Real-time analytical KPIs showing average safety scores, total apps analyzed, and interactive sorting for "High Risk" threats.

### 📄 Universal Extraction
Native support for HTML privacy pages and direct PDF downloads (corporate policies).

## 💻 Hardware Optimization (AMD ROCm)
ConsentIQ is designed to run locally on your hardware. If you have an AMD GPU, you can leverage **ROCm** to run the NLP models 10x faster than CPU. 

*See the [ROCm_Guide.md](ROCm_Guide.md) for setup instructions.*

## ⚙️ Installation & Usage

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- Chromium (for Playwright)

### 1. Setup the Repository
```bash
git clone https://github.com/yourusername/consentiq.git
cd consentiq
npm install
```

### 2. Setup the AI Brain (Python)
```bash
cd python-nlp
pip install -r requirements.txt
python -m playwright install chromium
```

### 3. Run Everything
Use the integrated development command to launch the dashboard and the AI Brain simultaneously:
```bash
npm run dev:all
```
The app will be live at `http://localhost:3007`.

## 📸 Screenshots
| Dashboard Intelligence | Data Nutrition Label |
|:---:|:---:|
| ![Stats](./docs/assets/dashboard.png) | ![Label](./docs/assets/label.png) |

---
**Hackathon**: AMD Slingshot Hackathon  
**Role**: Privacy Specialist & Full-Stack Engineer  
**Cost**: $0.00 (Fully Autonomous local inference)
