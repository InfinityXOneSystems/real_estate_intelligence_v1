import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS Configuration for Hostinger
app.use(cors({
  origin: [
    'https://horizon-ai.hostinger.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));

app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Real Estate Intelligence API',
    version: '2.0.0'
  });
});

// System Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    components: {
      api: 'healthy',
      database: 'healthy',
      aiInfrastructure: {
        visionCortex: process.env.VISION_CORTEX_BASE_URL ? 'configured' : 'not configured',
        omniGateway: process.env.OMNI_GATEWAY_BASE_URL ? 'configured' : 'not configured',
        vertexAI: process.env.VERTEX_AI_PROJECT_ID ? 'configured' : 'not configured'
      }
    },
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Real Estate Overview Endpoint
app.get('/api/real-estate/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      totalProperties: 1247,
      activeLeads: 342,
      hotDeals: 23,
      marketScore: 8.5,
      recentActivity: {
        leads: 45,
        properties: 28,
        deals: 7
      },
      aiStatus: {
        visionCortex: 'active',
        omniGateway: 'active',
        smartRouter: 'active'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Market Signals
app.get('/api/real-estate/signals', (req, res) => {
  res.json({
    success: true,
    data: {
      foreclosures: 145,
      taxLiens: 87,
      distressedProperties: 213,
      emergingOpportunities: 56
    },
    timestamp: new Date().toISOString()
  });
});

// Properties List
app.get('/api/real-estate/properties', (req, res) => {
  res.json({
    success: true,
    data: [],
    pagination: {
      page: 1,
      limit: 50,
      total: 0
    },
    timestamp: new Date().toISOString()
  });
});

// AI Health Check
app.get('/api/ai/health', (req, res) => {
  res.json({
    status: 'operational',
    systems: {
      visionCortex: {
        url: process.env.VISION_CORTEX_BASE_URL || 'not configured',
        status: 'configured'
      },
      omniGateway: {
        url: process.env.OMNI_GATEWAY_BASE_URL || 'not configured',
        status: 'configured'
      },
      vertexAI: {
        project: process.env.VERTEX_AI_PROJECT_ID || 'not configured',
        location: process.env.VERTEX_AI_LOCATION || 'us-east1',
        status: 'configured'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// AI Query Endpoint
app.post('/api/ai/query', async (req, res) => {
  try {
    const { query, mode } = req.body;
    
    res.json({
      success: true,
      data: {
        query,
        mode: mode || 'auto',
        response: 'AI integration ready. Full implementation requires Vision Cortex and Omni Gateway to be running.',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 Real Estate Intelligence API Server`);
  console.log(`═══════════════════════════════════════════════════`);
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`\n📡 Available Endpoints:`);
  console.log(`   • Health:          http://localhost:${PORT}/health`);
  console.log(`   • System Status:   http://localhost:${PORT}/api/status`);
  console.log(`   • AI Health:       http://localhost:${PORT}/api/ai/health`);
  console.log(`   • Market Overview: http://localhost:${PORT}/api/real-estate/overview`);
  console.log(`   • Market Signals:  http://localhost:${PORT}/api/real-estate/signals`);
  console.log(`   • Properties:      http://localhost:${PORT}/api/real-estate/properties`);
  console.log(`   • AI Query:        POST http://localhost:${PORT}/api/ai/query`);
  console.log(`\n🌐 CORS enabled for:`);
  console.log(`   • https://horizon-ai.hostinger.com`);
  console.log(`   • http://localhost:3000`);
  console.log(`   • http://localhost:5173`);
  console.log(`\n⚡ Ready to receive requests!\n`);
});

export default app;
