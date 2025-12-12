/**
 * Unified AI Infrastructure Integration
 * 
 * Combines all AI systems:
 * - Vision Cortex (hyper-intelligence)
 * - Omni Gateway (smart routing)
 * - Intelligent LLM Router (local multi-model)
 * - Vertex AI (Google Cloud native)
 * 
 * @package integrations
 * @author JARVIS
 * @version 1.0.0
 */

import { visionCortexClient } from './vision-cortex-client';
import { omniGatewayClient } from './omni-gateway-client';
import { intelligentLLMRouter } from '../intelligence/intelligent-llm-router';
import winston from 'winston';

// ============================================================================
// LOGGER SETUP
// ============================================================================

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'unified-ai-integration' },
  transports: [
    new winston.transports.File({ filename: 'logs/unified-ai.log' }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UnifiedAIRequest {
  query: string;
  context?: Record<string, any>;
  mode?: 'local' | 'vision-cortex' | 'omni-gateway' | 'auto';
  requestType?: 'reasoning' | 'multimodal' | 'fast' | 'creative' | 'analysis' | 'prediction';
  priority?: 'cost' | 'latency' | 'quality';
}

export interface UnifiedAIResponse {
  content: string;
  source: 'local-llm' | 'vision-cortex' | 'omni-gateway';
  model: string;
  confidence: number;
  latency: number;
  tokensUsed?: number;
  cost?: number;
}

// ============================================================================
// UNIFIED AI INTEGRATION
// ============================================================================

export class UnifiedAIIntegration {
  private visionCortexAvailable: boolean = false;
  private omniGatewayAvailable: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize all AI systems
   */
  private async initialize(): Promise<void> {
    try {
      // Check Vision Cortex availability
      this.visionCortexAvailable = await visionCortexClient.healthCheck();
      logger.info('Vision Cortex availability', { 
        available: this.visionCortexAvailable 
      });

      // Check Omni Gateway availability
      const gatewayHealth = await omniGatewayClient.healthCheck();
      this.omniGatewayAvailable = gatewayHealth.status !== 'offline';
      logger.info('Omni Gateway availability', { 
        available: this.omniGatewayAvailable 
      });

      logger.info('Unified AI Integration initialized', {
        visionCortex: this.visionCortexAvailable,
        omniGateway: this.omniGatewayAvailable,
        localLLM: true,
      });
    } catch (error: any) {
      logger.error('Error initializing AI systems', { error: error.message });
    }
  }

  /**
   * Execute AI request with automatic routing
   */
  async execute(request: UnifiedAIRequest): Promise<UnifiedAIResponse> {
    const startTime = Date.now();

    try {
      // Auto-select mode if not specified
      const mode = request.mode || this.selectOptimalMode(request);

      logger.info('Executing unified AI request', { 
        mode,
        requestType: request.requestType 
      });

      let response: UnifiedAIResponse;

      switch (mode) {
        case 'vision-cortex':
          response = await this.executeVisionCortex(request);
          break;
        case 'omni-gateway':
          response = await this.executeOmniGateway(request);
          break;
        case 'local':
        default:
          response = await this.executeLocalLLM(request);
          break;
      }

      response.latency = Date.now() - startTime;

      logger.info('Unified AI request completed', { 
        source: response.source,
        latency: response.latency 
      });

      return response;
    } catch (error: any) {
      logger.error('Unified AI request failed', { error: error.message });
      
      // Fallback to local LLM if primary fails
      if (request.mode !== 'local') {
        logger.info('Falling back to local LLM');
        return this.executeLocalLLM(request);
      }

      throw error;
    }
  }

  /**
   * Execute via Vision Cortex (for predictions and strategic reasoning)
   */
  private async executeVisionCortex(request: UnifiedAIRequest): Promise<UnifiedAIResponse> {
    if (request.requestType === 'prediction') {
      const prediction = await visionCortexClient.predict({
        query: request.query,
        context: request.context,
        horizon: '1m',
      });

      return {
        content: JSON.stringify(prediction.prediction),
        source: 'vision-cortex',
        model: 'vision-cortex-predictor',
        confidence: prediction.confidence,
        latency: 0,
      };
    } else {
      const reasoning = await visionCortexClient.reason({
        query: request.query,
        context: request.context,
        goal: 'roi-optimization',
      });

      return {
        content: reasoning.reasoning,
        source: 'vision-cortex',
        model: 'vision-cortex-reasoner',
        confidence: reasoning.confidence,
        latency: 0,
      };
    }
  }

  /**
   * Execute via Omni Gateway (for intelligent routing)
   */
  private async executeOmniGateway(request: UnifiedAIRequest): Promise<UnifiedAIResponse> {
    const routeResponse = await omniGatewayClient.route({
      prompt: request.query,
      context: request.context,
      requestType: request.requestType,
      priority: request.priority,
    });

    return {
      content: routeResponse.content,
      source: 'omni-gateway',
      model: routeResponse.model,
      confidence: routeResponse.confidence,
      latency: routeResponse.latency,
      tokensUsed: routeResponse.tokensUsed,
      cost: routeResponse.cost,
    };
  }

  /**
   * Execute via Local LLM Router
   */
  private async executeLocalLLM(request: UnifiedAIRequest): Promise<UnifiedAIResponse> {
    const llmResponse = await intelligentLLMRouter.executeRequest({
      prompt: request.query,
      context: request.context,
      type: request.requestType,
    });

    return {
      content: llmResponse.content,
      source: 'local-llm',
      model: llmResponse.model,
      confidence: llmResponse.confidence,
      latency: llmResponse.latency,
      tokensUsed: llmResponse.tokensUsed,
      cost: (llmResponse.tokensUsed / 1000000) * 3.0, // Estimate
    };
  }

  /**
   * Select optimal execution mode based on request characteristics
   */
  private selectOptimalMode(request: UnifiedAIRequest): 'local' | 'vision-cortex' | 'omni-gateway' {
    // Use Vision Cortex for predictions and strategic reasoning
    if (this.visionCortexAvailable && 
        (request.requestType === 'prediction' || 
         request.query.toLowerCase().includes('predict') ||
         request.query.toLowerCase().includes('forecast'))) {
      return 'vision-cortex';
    }

    // Use Omni Gateway for complex multi-modal or when quality is priority
    if (this.omniGatewayAvailable && 
        (request.requestType === 'multimodal' || 
         request.priority === 'quality')) {
      return 'omni-gateway';
    }

    // Default to local LLM router (fast, cost-effective, reliable)
    return 'local';
  }

  /**
   * Real Estate Market Analysis
   */
  async analyzeMarket(marketData: Record<string, any>): Promise<UnifiedAIResponse> {
    return this.execute({
      query: 'Analyze the real estate market data and provide investment recommendations',
      context: { marketData },
      requestType: 'analysis',
      priority: 'quality',
      mode: 'auto',
    });
  }

  /**
   * Property Valuation
   */
  async valuateProperty(propertyData: Record<string, any>): Promise<UnifiedAIResponse> {
    return this.execute({
      query: `Provide a detailed valuation analysis for this property: ${JSON.stringify(propertyData)}`,
      context: { propertyData },
      requestType: 'analysis',
      priority: 'quality',
      mode: 'auto',
    });
  }

  /**
   * Market Prediction
   */
  async predictMarket(timeframe: string, region: string): Promise<UnifiedAIResponse> {
    return this.execute({
      query: `Predict real estate market trends for ${region} over the next ${timeframe}`,
      context: { timeframe, region },
      requestType: 'prediction',
      mode: 'vision-cortex',
    });
  }

  /**
   * Investment Strategy
   */
  async getInvestmentStrategy(investorProfile: Record<string, any>): Promise<UnifiedAIResponse> {
    return this.execute({
      query: 'Generate an optimal real estate investment strategy',
      context: { investorProfile },
      requestType: 'reasoning',
      priority: 'quality',
      mode: 'vision-cortex',
    });
  }

  /**
   * Get System Status
   */
  getStatus() {
    return {
      visionCortexAvailable: this.visionCortexAvailable,
      omniGatewayAvailable: this.omniGatewayAvailable,
      localLLMAvailable: true,
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const unifiedAI = new UnifiedAIIntegration();
