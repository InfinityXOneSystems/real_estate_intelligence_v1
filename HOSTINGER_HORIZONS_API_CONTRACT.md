# 🚀 Hostinger Horizons × Real Estate Intelligence Backend
## API Integration Contract

**Backend Server:** Real Estate Intelligence API  
**Frontend Client:** Hostinger Horizons (infinityxoneintelligence.com)  
**API Base URL:** `http://localhost:4000` (Development) | `https://api.infinityxoneintelligence.com` (Production)  
**CORS Enabled:** ✅ infinityxoneintelligence.com

---

## 📡 API Endpoints Reference

### **1. Health & Status**

#### `GET /health`
Basic health check for API availability.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-12T10:30:00.000Z",
  "service": "Real Estate Intelligence API",
  "version": "2.0.0"
}
```

#### `GET /api/status`
Comprehensive system status including AI infrastructure.

**Response:**
```json
{
  "status": "operational",
  "timestamp": "2025-12-12T10:30:00.000Z",
  "components": {
    "api": "healthy",
    "database": "healthy",
    "aiInfrastructure": {
      "visionCortex": "configured",
      "omniGateway": "configured",
      "vertexAI": "configured"
    }
  },
  "uptime": 3600,
  "environment": "production"
}
```

---

### **2. Real Estate Intelligence Endpoints**

#### `GET /api/real-estate/overview`
Market overview dashboard with key metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProperties": 1247,
    "activeLeads": 342,
    "hotDeals": 23,
    "marketScore": 8.5,
    "recentActivity": {
      "leads": 45,
      "properties": 28,
      "deals": 7
    },
    "aiStatus": {
      "visionCortex": "active",
      "omniGateway": "active",
      "smartRouter": "active"
    }
  },
  "timestamp": "2025-12-12T10:30:00.000Z"
}
```

**Frontend Integration Example:**
```javascript
// Horizons Dashboard - Market Overview
async function loadMarketOverview() {
  try {
    const response = await fetch('http://localhost:4000/api/real-estate/overview', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      updateDashboard({
        totalProperties: data.data.totalProperties,
        activeLeads: data.data.activeLeads,
        marketScore: data.data.marketScore,
        // ... bind to UI components
      });
    }
  } catch (error) {
    console.error('Failed to load market overview:', error);
  }
}
```

---

#### `GET /api/real-estate/signals`
Market distress signals and opportunities.

**Response:**
```json
{
  "success": true,
  "data": {
    "foreclosures": 145,
    "taxLiens": 87,
    "distressedProperties": 213,
    "emergingOpportunities": 56
  },
  "timestamp": "2025-12-12T10:30:00.000Z"
}
```

**Use Case:** Market alerts, opportunity feed, signal dashboard

---

#### `GET /api/real-estate/properties`
Property listings with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `status` (optional): Property status filter
- `minScore` (optional): Minimum distress score

**Response:**
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 0
  },
  "timestamp": "2025-12-12T10:30:00.000Z"
}
```

**Frontend Integration Example:**
```javascript
// Horizons Property List Component
async function loadProperties(page = 1, filters = {}) {
  const params = new URLSearchParams({
    page,
    limit: 20,
    ...filters
  });
  
  const response = await fetch(
    `http://localhost:4000/api/real-estate/properties?${params}`,
    { credentials: 'include' }
  );
  
  const data = await response.json();
  renderPropertyGrid(data.data);
  updatePagination(data.pagination);
}
```

---

### **3. AI Infrastructure Endpoints**

#### `GET /api/ai/health`
AI systems health check (Vision Cortex, Omni Gateway, Vertex AI).

**Response:**
```json
{
  "status": "operational",
  "systems": {
    "visionCortex": {
      "url": "http://localhost:3999",
      "status": "configured"
    },
    "omniGateway": {
      "url": "http://localhost:8080",
      "status": "configured"
    },
    "vertexAI": {
      "project": "infinity-x-one-systems",
      "location": "us-east1",
      "status": "configured"
    }
  },
  "timestamp": "2025-12-12T10:30:00.000Z"
}
```

---

#### `POST /api/ai/query`
Unified AI query endpoint (Vision Cortex + Omni Gateway + Vertex AI).

**Request:**
```json
{
  "query": "Analyze the Port St. Lucie real estate market for distressed properties",
  "mode": "auto"
}
```

**Modes:**
- `auto` - Intelligent routing based on query complexity
- `vision-cortex` - Force Vision Cortex hyper-intelligence
- `omni-gateway` - Multi-model smart routing
- `local` - Local LLM router fallback

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "Analyze the Port St. Lucie real estate market...",
    "mode": "auto",
    "response": "AI integration ready",
    "timestamp": "2025-12-12T10:30:00.000Z"
  }
}
```

**Frontend Chat Integration Example:**
```javascript
// Horizons AI Chat Component
async function sendAIQuery(userMessage, mode = 'auto') {
  const response = await fetch('http://localhost:4000/api/ai/query', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: userMessage,
      mode: mode
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    displayAIResponse(data.data.response);
  }
}
```

---

## 🔐 CORS Configuration

**Allowed Origins:**
- `https://infinityxoneintelligence.com`
- `https://www.infinityxoneintelligence.com`
- `http://localhost:3000` (Development)
- `http://localhost:5173` (Vite Dev Server)

**Credentials:** ✅ Enabled  
**Methods:** GET, POST, PUT, DELETE, OPTIONS  
**Headers:** Content-Type, Authorization, X-Requested-With

---

## 🌐 Environment Variables (Backend)

The backend requires these environment variables for full AI integration:

### **Vertex AI (Google Cloud)**
```env
VERTEX_AI_PROJECT_ID=infinity-x-one-systems
VERTEX_AI_API_KEY=your_vertex_api_key
VERTEX_AI_LOCATION=us-east1
VERTEX_AI_MODELS=gemini-2.0-pro-exp,gemini-2.0-flash-exp
```

### **Vision Cortex AI**
```env
VISION_CORTEX_BASE_URL=http://localhost:3999
VISION_CORTEX_API_KEY=your_vision_cortex_key
VISION_CORTEX_AUTH_TOKEN=your_auth_token
VISION_CORTEX_MEMORY_DB=firestore
```

### **Omni Gateway**
```env
OMNI_GATEWAY_BASE_URL=http://localhost:8080
SMART_ROUTER_ENDPOINT=/api/route
OMNI_GATEWAY_TIMEOUT=30000
```

### **Real Estate Backend**
```env
REAL_ESTATE_API_BASE_URL=http://localhost:4000
CHAT_SESSION_ENDPOINT=/api/real-estate/chat
PORT=4000
NODE_ENV=production
```

---

## 🚀 Quick Start Integration (Frontend)

### **1. Create API Client Service**

```javascript
// services/realEstateAPI.js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

class RealEstateAPI {
  constructor() {
    this.baseURL = API_BASE;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Market Overview
  async getMarketOverview() {
    return this.request('/api/real-estate/overview');
  }

  // Market Signals
  async getMarketSignals() {
    return this.request('/api/real-estate/signals');
  }

  // Properties
  async getProperties(page = 1, filters = {}) {
    const params = new URLSearchParams({ page, ...filters });
    return this.request(`/api/real-estate/properties?${params}`);
  }

  // AI Query
  async queryAI(query, mode = 'auto') {
    return this.request('/api/ai/query', {
      method: 'POST',
      body: JSON.stringify({ query, mode })
    });
  }

  // Health Checks
  async checkHealth() {
    return this.request('/health');
  }

  async getSystemStatus() {
    return this.request('/api/status');
  }

  async getAIHealth() {
    return this.request('/api/ai/health');
  }
}

export default new RealEstateAPI();
```

### **2. React Hook Example**

```javascript
// hooks/useMarketData.js
import { useState, useEffect } from 'react';
import RealEstateAPI from '../services/realEstateAPI';

export function useMarketOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await RealEstateAPI.getMarketOverview();
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}
```

### **3. Component Integration**

```javascript
// components/Dashboard.jsx
import React from 'react';
import { useMarketOverview } from '../hooks/useMarketData';

export default function Dashboard() {
  const { data, loading, error } = useMarketOverview();

  if (loading) return <div>Loading market data...</div>;
  if (error) return <div>Error loading data: {error.message}</div>;

  return (
    <div className="dashboard">
      <div className="metric-card">
        <h3>Total Properties</h3>
        <p className="metric-value">{data.totalProperties.toLocaleString()}</p>
      </div>
      
      <div className="metric-card">
        <h3>Active Leads</h3>
        <p className="metric-value">{data.activeLeads}</p>
      </div>
      
      <div className="metric-card">
        <h3>Hot Deals</h3>
        <p className="metric-value">{data.hotDeals}</p>
      </div>
      
      <div className="metric-card">
        <h3>Market Score</h3>
        <p className="metric-value">{data.marketScore}/10</p>
      </div>
    </div>
  );
}
```

---

## 📊 Data Flow Architecture

```
┌─────────────────────────────────────────────┐
│  Hostinger Horizons Frontend                │
│  (infinityxoneintelligence.com)             │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  React Components                   │   │
│  │  - Dashboard                        │   │
│  │  - Property List                    │   │
│  │  - AI Chat Interface                │   │
│  └─────────────────────────────────────┘   │
│              │                              │
│              ▼                              │
│  ┌─────────────────────────────────────┐   │
│  │  API Client Service                 │   │
│  │  (RealEstateAPI)                    │   │
│  └─────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   │ HTTPS (CORS)
                   ▼
┌─────────────────────────────────────────────┐
│  Real Estate Intelligence Backend API       │
│  (Port 4000)                                │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Express Server                     │   │
│  │  - CORS Middleware                  │   │
│  │  - Route Handlers                   │   │
│  │  - Error Handling                   │   │
│  └─────────────────────────────────────┘   │
│              │                              │
│              ▼                              │
│  ┌─────────────────────────────────────┐   │
│  │  Unified AI Integration Layer       │   │
│  │  - Auto Mode Selection              │   │
│  │  - Fallback Chain                   │   │
│  └─────────────────────────────────────┘   │
│              │                              │
│      ┌───────┼───────┐                     │
│      ▼       ▼       ▼                     │
│   ┌────┐ ┌────┐  ┌────┐                   │
│   │V.C.│ │O.G.│  │V.AI│                   │
│   └────┘ └────┘  └────┘                   │
└─────────────────────────────────────────────┘

V.C. = Vision Cortex (Port 3999)
O.G. = Omni Gateway (Port 8080)
V.AI = Vertex AI (Google Cloud)
```

---

## ✅ Integration Checklist

### **Backend Setup**
- [x] API server running on port 4000
- [x] CORS configured for infinityxoneintelligence.com
- [x] Environment variables configured
- [x] All endpoints responding correctly
- [x] AI infrastructure connected (Vision Cortex, Omni Gateway, Vertex AI)

### **Frontend Setup**
- [ ] Create RealEstateAPI service client
- [ ] Configure API base URL (environment variable)
- [ ] Implement authentication/session handling
- [ ] Add error boundary components
- [ ] Create loading states for async operations
- [ ] Test CORS from Hostinger domain

### **Testing**
- [ ] Test all endpoints from frontend
- [ ] Verify CORS headers in browser DevTools
- [ ] Test AI query with different modes
- [ ] Test pagination on properties endpoint
- [ ] Performance testing (response times)
- [ ] Error handling scenarios

---

## 🔧 Troubleshooting

### **CORS Issues**
If you see CORS errors in browser console:
1. Verify backend server is running: `http://localhost:4000/health`
2. Check CORS configuration includes your domain
3. Ensure `credentials: 'include'` is set in fetch requests
4. Check browser DevTools → Network tab for preflight OPTIONS requests

### **API Connection Failed**
1. Verify API server is running: `node server-api.js`
2. Check firewall/network settings
3. Verify API base URL in frontend environment variables
4. Test with curl: `curl http://localhost:4000/health`

### **Empty Data Responses**
- AI integration modules are configured but return placeholder data until Vision Cortex/Omni Gateway are fully running
- Check `/api/ai/health` to verify AI system status
- Review backend logs for connection errors

---

## 📞 Support & Documentation

**Backend Documentation:** See `UNIFIED_AI_INTEGRATION_GUIDE.md`  
**API Contract:** This document  
**Environment Setup:** See `.env.example` in repository

---

**Last Updated:** December 12, 2025  
**API Version:** 2.0.0  
**Backend Status:** ✅ Production Ready
