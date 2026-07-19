'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// ---------------------------------------------------------------------------
// SSE 事件类型（与后端 stream/route.ts 对应）
// ---------------------------------------------------------------------------

export type SSEEvent =
  | { type: 'start'; simulationId: string; totalRounds: number; agentCount: number }
  | { type: 'graph_built'; graphSummary: string; nodeCount: number; edgeCount: number; keyNodes: Array<{ name: string; nodeType: string; centrality: number }> }
  | { type: 'classical_done'; round: number; reports: Array<{ bookId: string; bookName: string; judgment: string; directionScore: number; consensus: string }>; consensusScore: number }
  | { type: 'agent_start'; round: number; agentRole: string; agentName: string }
  | { type: 'agent_done'; round: number; agentRole: string; agentName: string; content: string; tokensUsed: number }
  | { type: 'round_done'; round: number }
  | { type: 'synthesizing' }
  | { type: 'complete'; simulationId: string; scenarios: any[]; crossValidation: any; finalRecommendation: string; keyDivergences: string[]; totalTokensUsed: number }
  | { type: 'error'; message: string };

interface UseSimulationStreamOptions {
  onEvent?: (event: SSEEvent) => void;
  onComplete?: (event: Extract<SSEEvent, { type: 'complete' }>) => void;
  onError?: (message: string) => void;
}

interface UseSimulationStreamResult {
  start: (body: any) => void;
  stop: () => void;
  isStreaming: boolean;
  events: SSEEvent[];
  error: string | null;
}

/**
 * 订阅推演 SSE 流的 hook
 *
 * 使用 fetch + ReadableStream 而非 EventSource，因为：
 * 1. EventSource 只支持 GET，我们需要 POST
 * 2. EventSource 不能自定义 headers
 */
export function useSimulationStream(
  url: string,
  options?: UseSimulationStreamOptions,
): UseSimulationStreamResult {
  const [isStreaming, setIsStreaming] = useState(false);
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const start = useCallback(async (body: any) => {
    setIsStreaming(true);
    setError(null);
    setEvents([]);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 解析 SSE 事件（以 \n\n 分隔）
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? ''; // 最后一行可能不完整

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          try {
            const event: SSEEvent = JSON.parse(jsonStr);
            setEvents(prev => [...prev, event]);
            options?.onEvent?.(event);

            if (event.type === 'complete') {
              options?.onComplete?.(event);
            } else if (event.type === 'error') {
              setError(event.message);
              options?.onError?.(event.message);
            }
          } catch (err) {
            console.error('[SSE] Parse error:', err, jsonStr);
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.log('[SSE] Stream aborted');
      } else {
        const msg = err instanceof Error ? err.message : 'Stream error';
        setError(msg);
        options?.onError?.(msg);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [url, options]);

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return { start, stop, isStreaming, events, error };
}
