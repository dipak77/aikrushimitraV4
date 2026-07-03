export interface AITelemetryMetric {
  provider: string;
  model: string;
  task: string;
  latencyMs: number;
  success: boolean;
  error?: string;
  timestamp: number;
}

export class AITelemetry {
  private static metrics: AITelemetryMetric[] = [];

  static logMetric(metric: Omit<AITelemetryMetric, 'timestamp'>) {
    const fullMetric: AITelemetryMetric = {
      ...metric,
      timestamp: Date.now()
    };
    this.metrics.push(fullMetric);
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }
    console.log(`📊 AITelemetry [${metric.provider}:${metric.model}] ${metric.task} - ${metric.latencyMs}ms (Success: ${metric.success})`);
  }

  static getMetrics(): AITelemetryMetric[] {
    return [...this.metrics];
  }
}
