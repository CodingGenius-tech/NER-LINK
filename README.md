# NER-LINK

## National Emergency Road & Logistics Intelligence Network

NER-LINK is a smart road-disruption and logistics management prototype developed for Smart India Hackathon problem statement SIH26002.

The system is designed to help monitor road conditions, detect and record disruptions, estimate road-related risk using classical machine learning, and recommend safer alternative routes for logistics operations.

---

## Core Objective

NER-LINK aims to provide:

- Road condition monitoring
- Field incident reporting
- Weather-aware risk analysis
- Vehicle and delivery tracking
- Road disruption risk prediction
- Alternative route recommendation
- Real-time alerts
- GIS-based visualization
- Logistics monitoring dashboard

---

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- Leaflet
- OpenStreetMap

### Backend

- Node.js
- Express.js
- REST API
- JWT Authentication

### Database

- PostgreSQL
- PostGIS

### Machine Learning

- Python
- scikit-learn
- Classical Machine Learning only

### ML Models

Initial candidates:

- Logistic Regression
- Random Forest

Deep Learning models are intentionally excluded from this project.

---

## System Architecture

```text
React Frontend
      |
      v
Node.js + Express Backend
      |
      +--------------------+
      |                    |
      v                    v
PostgreSQL + PostGIS    Python ML Engine
      |                    |
      +---------+----------+
                |
                v
       Risk Prediction
                |
                v
        Route Intelligence
                |
                v
             Alerts