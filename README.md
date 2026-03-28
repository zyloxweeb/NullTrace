# NullTrace

NullTrace is a self-hosted static analysis platform for suspicious files.

It is designed as a personal cybersecurity project focused on:
- artifact inspection
- IOC extraction
- suspicious pattern detection
- trust-aware scoring
- verdict-based analysis

The goal is to build a tool that feels closer to a real analysis workspace rather than a generic dashboard.

---

## Features

- Static file analysis  
- SHA-256 and MD5 hashing  
- MIME type and file category detection  
- Extracted strings inspection  
- IOC extraction:
  - URLs  
  - domains  
  - IPs  
  - emails  
- Suspicious pattern detection  
- Trust-aware scoring system  
- Verdict classification:
  - benign  
  - likely_benign  
  - suspicious  
  - high_risk  
- Saved analysis cases  
- Interactive frontend workspace  

---

## Tech Stack

### Backend
- FastAPI  
- Python  
- Uvicorn  

### Frontend
- React  
- TypeScript  
- Vite  
- Tailwind CSS  
- Framer Motion  

---

## Project Structure

NullTrace/
│
├── backend/
│   ├── app/
│   │   ├── analyzers/
│   │   ├── detection/
│   │   ├── extractors/
│   │   ├── scoring/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.py
│   ├── storage/
│   │   └── analyses/
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   └── package.json
│
└── README.md

---

## Current Status

NullTrace is currently under active development.

The project already includes a working backend and frontend, with support for:

- file upload  
- local static analysis  
- stored case navigation  
- verdict-based result visualization  

This repository is being updated incrementally as the project evolves.

---

## Setup

### Backend

cd backend  
python -m venv venv  
venv\Scripts\activate  
pip install -r requirements.txt  
python -m uvicorn app.main:app --reload  

Backend runs on:

http://127.0.0.1:8000  

Swagger docs:

http://127.0.0.1:8000/docs  

---

### Frontend

cd frontend  
npm install  
npm run dev  

Frontend runs on:

http://localhost:5173  

---

## Example Workflow

1. Upload a file  
2. NullTrace performs static analysis  
3. The platform extracts indicators and suspicious patterns  
4. Trust signals are evaluated  
5. A final verdict is generated and displayed in the analysis workspace  

---

## Roadmap

- Better trust modeling  
- Improved false positive reduction  
- Stronger IOC classification  
- Richer frontend motion and visuals  
- Report export  
- File-type specific parsing  
- PE-focused enhancements  
- Smarter verdict confidence system  

---

## Disclaimer

NullTrace is a personal educational project for defensive security research and static analysis experimentation.

It is not intended to replace professional malware analysis platforms.

---

## Author

Giuseppe Fattor (aka zylox).

---

## License

This project is licensed under the MIT License.