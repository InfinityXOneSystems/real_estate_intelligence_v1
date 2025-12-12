const express = require('express');
const cors = require('cors');
const { VertexAI } = require('@google-cloud/vertexai');
const { google } = require('googleapis');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Configuration from environment variables
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'infinity-x-one-systems';
const LOCATION = process.env.GOOGLE_CLOUD_REGION || 'us-east1';
const GCS_BUCKET = process.env.GCS_BUCKET_NAME || 'real-estate-intelligence';
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || '1G4ACS7NJRBcE8XyhU4V2un5xPIm_b90fPi2Rt4iMs4k';

// Initialize Firebase Admin
let firestore, bucket, vertex, sheets, drive;
let initErrors = [];

try {
  admin.initializeApp({
    projectId: PROJECT_ID
  });
  firestore = admin.firestore();
  console.log('✓ Firebase Admin initialized');
} catch (error) {
  console.error('✗ Firebase Admin failed:', error.message);
  initErrors.push('Firebase Admin: ' + error.message);
}

// Initialize Google Cloud Storage
try {
  const storage = new Storage({ projectId: PROJECT_ID });
  bucket = storage.bucket(GCS_BUCKET);
  console.log('✓ Cloud Storage initialized');
} catch (error) {
  console.error('✗ Cloud Storage failed:', error.message);
  initErrors.push('Cloud Storage: ' + error.message);
}

// Initialize Vertex AI
try {
  vertex = new VertexAI({
    project: PROJECT_ID,
    location: LOCATION
  });
  console.log('✓ Vertex AI initialized');
} catch (error) {
  console.error('✗ Vertex AI failed:', error.message);
  initErrors.push('Vertex AI: ' + error.message);
}

// Initialize Google APIs
try {
  const auth = new google.auth.GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/drive.readonly'
    ]
  });
  sheets = google.sheets({ version: 'v4', auth });
  drive = google.drive({ version: 'v3', auth });
  console.log('✓ Google APIs initialized');
} catch (error) {
  console.error('✗ Google APIs failed:', error.message);
  initErrors.push('Google APIs: ' + error.message);
}

// CORS Configuration
app.use(cors({
  origin: [
    'https://infinityxoneintelligence.com',
    'https://www.infinityxoneintelligence.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: initErrors.length === 0 ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'Real Estate Intelligence',
    version: '5.0.0',
    environment: process.env.NODE_ENV || 'production',
    errors: initErrors.length > 0 ? initErrors : undefined
  });
});

// System Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    components: {
      api: 'active',
      vertexAI: vertex ? 'active' : 'inactive',
      firestore: firestore ? 'active' : 'inactive',
      cloudStorage: bucket ? 'active' : 'inactive',
      googleSheets: sheets ? 'active' : 'inactive',
      googleDrive: drive ? 'active' : 'inactive',
      rag: firestore ? 'active' : 'inactive'
    },
    config: {
      projectId: PROJECT_ID,
      region: LOCATION,
      bucket: GCS_BUCKET,
      port: PORT
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// AI Query with RAG Memory
app.post('/api/ai/query', async (req, res) => {
  try {
    if (!vertex) {
      return res.status(503).json({ 
        success: false, 
        error: 'Vertex AI not available' 
      });
    }

    const { query, useMemory = true } = req.body;
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: 'Query is required' 
      });
    }

    let context = '';
    let memories = [];

    // Fetch memory context
    if (useMemory && firestore) {
      try {
        const memorySnapshot = await firestore
          .collection('memory')
          .orderBy('timestamp', 'desc')
          .limit(5)
          .get();
        
        memories = memorySnapshot.docs.map(doc => doc.data());
        context = memories.map(m => m.content).join('\n');
      } catch (err) {
        console.warn('Memory fetch warning:', err.message);
      }
    }

    // Query Vertex AI
    const model = vertex.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = context ? `Context:\n${context}\n\nQuery: ${query}` : query;
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Store interaction
    if (firestore) {
      try {
        await firestore.collection('memory').add({
          type: 'interaction',
          query,
          response: response.substring(0, 500),
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          relevanceScore: 1.0
        });
      } catch (err) {
        console.warn('Memory storage warning:', err.message);
      }
    }

    res.json({
      success: true,
      data: {
        query,
        response,
        contextUsed: !!context,
        memoriesCount: memories.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('AI Query error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Memory Store
app.post('/api/memory/store', async (req, res) => {
  try {
    if (!firestore) {
      return res.status(503).json({ 
        success: false, 
        error: 'Firestore not available' 
      });
    }

    const { type, content, tags = [], metadata = {} } = req.body;
    
    if (!type || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Type and content are required' 
      });
    }

    const docRef = await firestore.collection('memory').add({
      type,
      content,
      tags,
      metadata,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      relevanceScore: 1.0,
      accessCount: 0
    });

    res.json({
      success: true,
      data: { id: docRef.id },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Memory store error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Memory Search
app.get('/api/memory/search', async (req, res) => {
  try {
    if (!firestore) {
      return res.status(503).json({ 
        success: false, 
        error: 'Firestore not available' 
      });
    }

    const { type, tags, limit = 10 } = req.query;
    let query = firestore.collection('memory');
    
    if (type) query = query.where('type', '==', type);
    if (tags) query = query.where('tags', 'array-contains', tags);
    
    const snapshot = await query
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const memories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      data: { memories, count: memories.length },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Memory search error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Cloud Storage Upload
app.post('/api/storage/upload', async (req, res) => {
  try {
    if (!bucket) {
      return res.status(503).json({ 
        success: false, 
        error: 'Cloud Storage not available' 
      });
    }

    const { fileName, content, metadata = {} } = req.body;
    
    if (!fileName || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'fileName and content are required' 
      });
    }

    const file = bucket.file(fileName);
    await file.save(content, {
      metadata: {
        contentType: 'application/json',
        ...metadata
      }
    });

    res.json({
      success: true,
      data: {
        fileName,
        bucket: GCS_BUCKET,
        url: `gs://${GCS_BUCKET}/${fileName}`
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Storage upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Cloud Storage List
app.get('/api/storage/files', async (req, res) => {
  try {
    if (!bucket) {
      return res.status(503).json({ 
        success: false, 
        error: 'Cloud Storage not available' 
      });
    }

    const [files] = await bucket.getFiles({ maxResults: 100 });
    
    const fileList = files.map(file => ({
      name: file.name,
      size: parseInt(file.metadata.size),
      created: file.metadata.timeCreated,
      updated: file.metadata.updated
    }));

    res.json({
      success: true,
      data: { files: fileList, bucket: GCS_BUCKET, count: fileList.length },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Storage list error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Google Sheets Data
app.get('/api/sheets/investor-data', async (req, res) => {
  try {
    if (!sheets) {
      return res.status(503).json({ 
        success: false, 
        error: 'Google Sheets not available' 
      });
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A1:Z1000'
    });

    const rows = response.data.values || [];

    res.json({
      success: true,
      data: {
        totalRows: rows.length,
        headers: rows[0] || [],
        records: rows.slice(1),
        spreadsheetId: SPREADSHEET_ID
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sheets error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Google Drive Files
app.get('/api/drive/files', async (req, res) => {
  try {
    if (!drive) {
      return res.status(503).json({ 
        success: false, 
        error: 'Google Drive not available' 
      });
    }

    const response = await drive.files.list({
      pageSize: 100,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime)'
    });

    res.json({
      success: true,
      data: { 
        files: response.data.files || [], 
        count: (response.data.files || []).length 
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Drive error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Firestore Properties - Query
app.get('/api/firestore/properties', async (req, res) => {
  try {
    if (!firestore) {
      return res.status(503).json({ 
        success: false, 
        error: 'Firestore not available' 
      });
    }

    const { limit = 50, city, zipCode } = req.query;
    let query = firestore.collection('properties');
    
    if (city) query = query.where('city', '==', city);
    if (zipCode) query = query.where('zipCode', '==', zipCode);
    
    const snapshot = await query.limit(parseInt(limit)).get();
    
    const properties = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      data: { properties, count: properties.length },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Firestore query error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Firestore Properties - Add
app.post('/api/firestore/properties', async (req, res) => {
  try {
    if (!firestore) {
      return res.status(503).json({ 
        success: false, 
        error: 'Firestore not available' 
      });
    }

    const propertyData = {
      ...req.body,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await firestore.collection('properties').add(propertyData);

    res.json({
      success: true,
      data: { id: docRef.id },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Firestore add error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Real Estate Overview
app.get('/api/real-estate/overview', async (req, res) => {
  try {
    let propertiesCount = 0;
    let memoriesCount = 0;

    if (firestore) {
      try {
        const [propertiesSnapshot, memoriesSnapshot] = await Promise.all([
          firestore.collection('properties').count().get(),
          firestore.collection('memory').count().get()
        ]);
        propertiesCount = propertiesSnapshot.data().count;
        memoriesCount = memoriesSnapshot.data().count;
      } catch (err) {
        console.warn('Count query warning:', err.message);
      }
    }

    res.json({
      success: true,
      data: {
        totalProperties: propertiesCount,
        totalMemories: memoriesCount,
        activeLeads: 342,
        hotDeals: 23,
        marketScore: 8.5,
        components: {
          vertexAI: vertex ? 'active' : 'inactive',
          firestore: firestore ? 'active' : 'inactive',
          cloudStorage: bucket ? 'active' : 'inactive',
          rag: firestore ? 'active' : 'inactive'
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Overview error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   Real Estate Intelligence System - Production Ready    ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\n  🌐 Server:      http://0.0.0.0:${PORT}`);
  console.log(`  🏗️  Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`  ☁️  Project:     ${PROJECT_ID}`);
  console.log(`  📍 Region:      ${LOCATION}`);
  console.log('\n──────────────────────────────────────────────────────────');
  console.log('  Components Status:');
  console.log(`    ${vertex ? '✓' : '✗'} Vertex AI (Gemini 2.0)`);
  console.log(`    ${firestore ? '✓' : '✗'} Firestore Database`);
  console.log(`    ${bucket ? '✓' : '✗'} Cloud Storage (${GCS_BUCKET})`);
  console.log(`    ${sheets ? '✓' : '✗'} Google Sheets API`);
  console.log(`    ${drive ? '✓' : '✗'} Google Drive API`);
  console.log('──────────────────────────────────────────────────────────');
  console.log('  Available Endpoints:');
  console.log('    GET  /health');
  console.log('    GET  /api/status');
  console.log('    POST /api/ai/query');
  console.log('    POST /api/memory/store');
  console.log('    GET  /api/memory/search');
  console.log('    POST /api/storage/upload');
  console.log('    GET  /api/storage/files');
  console.log('    GET  /api/sheets/investor-data');
  console.log('    GET  /api/drive/files');
  console.log('    GET  /api/firestore/properties');
  console.log('    POST /api/firestore/properties');
  console.log('    GET  /api/real-estate/overview');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║              🚀 READY TO RECEIVE REQUESTS 🚀             ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  if (initErrors.length > 0) {
    console.warn('\n⚠️  Initialization Warnings:');
    initErrors.forEach(err => console.warn(`  - ${err}`));
    console.warn('');
  }
});

// Graceful Shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received, shutting down gracefully...`);
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
