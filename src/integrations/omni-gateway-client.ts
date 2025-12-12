/**
 * Omni Gateway & Smart Router Client
 * 
 * Multi-model AI request routing and orchestration
 * Routes requests to optimal AI provider based on:
 * - Request type and complexity
 * - Cost optimization
 * - Latency requirements
 * - Model capabilities
 * 
 * @package integrations
 * @author JARVIS
 * @version 1.0.0
 */

import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';
import winston from 'winston';

dotenv.config();

// ============================================================================
// LOGGER SETUP
// ============================================================================

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'omni-gateway-client' },
  transports: [
    new winston.transports.File({ filename: 'logs/omni-gateway.log' }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface OmniGatewayConfig {
  baseUrl: string;
  apiKey?: string;
  authToken?: string;
  timeout?: number;
  smartRouterEndpoint?: string;
}

export interface RouteRequest {
  prompt: string;
  context?: Record<string, any>;
  requestType?: 'reasoning' | 'multimodal' | 'fast' | 'creative' | 'analysis';
  priority?: 'cost' | 'latency' | 'quality';
  constraints?: {
    maxLatency?: number;
    maxCost?: number;
    preferredModels?: string[];
  };
}

export interface RouteResponse {
  content: string;
  model: string;
  provider: string;
  latency: number;
  tokensUsed: number;
  cost: number;
  confidence: number;
  routingReason: string;
}

export interface ModelStatus {
  name: string;
  provider: string;
  available: boolean;
  latency: number;
  queueDepth: number;
}

export interface GatewayHealth {
  status: 'healthy' | 'degraded' | 'offline';
  models: ModelStatus[];
  timestamp: string;
}

// ============================================================================
// OMNI GATEWAY CLIENT
// ============================================================================

export class OmniGatewayClient {
  private client: AxiosInstance;
  private config: OmniGatewayConfig;

  constructor(config?: Partial<OmniGatewayConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || process.env.OMNI_GATEWAY_BASE_URL || 'http://localhost:8080',
      apiKey: config?.apiKey || process.env.OMNI_GATEWAY_API_KEY || '',
      authToken: config?.authToken || process.env.OMNI_GATEWAY_AUTH_TOKEN || '',
      timeout: config?.timeout || 60000,
      smartRouterEndpoint: config?.smartRouterEndpoint || process.env.SMART_ROUTER_ENDPOINT || '/api/route',
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'X-API-Key': this.config.apiKey }),
        ...(this.config.authToken && { 'Authorization': `Bearer ${this.config.authToken}` }),
      },
    });

    logger.info('Omni Gateway client initialized', { 
      baseUrl: this.config.baseUrl 
    });
  }

  /**
   * Route AI Request through Smart Router
   * Automatically selects optimal model based on request characteristics
   */
  async route(request: RouteRequest): Promise<RouteResponse> {
    try {
      logger.info('Omni Gateway routing request', { 
        requestType: request.requestType,
        priority: request.priority 
      });

      const response = await this.client.post(this.config.smartRouterEndpoint!, {
        prompt: request.prompt,
        context: request.context || {},
        requestType: request.requestType || 'analysis',
        priority: request.priority || 'quality',
        constraints: request.constraints || {},
        metadata: {
          source: 'real-estate-intelligence',
          timestamp: new Date().toISOString(),
        },
      });

      logger.info('Omni Gateway routing successful', { 
        model: response.data.model,
        provider: response.data.provider,
        latency: response.data.latency 
      });

      return response.data;
    } catch (error: any) {
      logger.error('Omni Gateway routing failed', { 
        error: error.message,
        status: error.response?.status 
      });
      throw new Error(`Omni Gateway routing failed: ${error.message}`);
    }
  }

  /**
   * Get Model Status
   * Check availability and performance of all models
   */
  async getModelStatus(): Promise<ModelStatus[]> {
    try {
      const response = await this.client.get('/api/models/status');
      logger.info('Retrieved model status', { 
        modelCount: response.data.length 
      });
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get model status', { 
        error: error.message 
      });
      throw new Error(`Failed to get model status: ${error.message}`);
    }
  }

  /**
   * Gateway Health Check
   */
  async healthCheck(): Promise<GatewayHealth> {
    try {
      const response = await this.client.get('/health');
      logger.info('Omni Gateway health check passed', { 
        status: response.data.status 
      });
      return response.data;
    } catch (error: any) {
      logger.error('Omni Gateway health check failed', { 
        error: error.message 
      });
      return {
        status: 'offline',
        models: [],
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Real Estate Property Analysis
   * Optimized routing for property-specific queries
   */
  async analyzeProperty(propertyData: Record<string, any>, query: string): Promise<RouteResponse> {
    return this.route({
      prompt: query,
      context: {
        propertyData,
        domain: 'real-estate-analysis',
      },
      requestType: 'analysis',
      priority: 'quality',
    });
  }

  /**
   * Market Prediction
   * Route to models best suited for predictive analytics
   */
  async predictMarket(marketData: Record<string, any>, timeframe: string): Promise<RouteResponse> {
    return this.route({
      prompt: `Predict real estate market trends for the next ${timeframe}`,
      context: {
        marketData,
        timeframe,
        domain: 'market-prediction',
      },
      requestType: 'reasoning',
      priority: 'quality',
    });
  }

  /**
   * Fast Query
   * Route to fastest available model for quick responses
   */
  async fastQuery(query: string, context?: Record<string, any>): Promise<RouteResponse> {
    return this.route({
      prompt: query,
      context,
      requestType: 'fast',
      priority: 'latency',
      constraints: {
        maxLatency: 1000, // 1 second
      },
    });
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const omniGatewayClient = new OmniGatewayClient();
