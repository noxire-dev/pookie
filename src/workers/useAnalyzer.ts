import { useState, useCallback, useRef, useEffect } from 'react';
import type { AnalysisResult, WorkerResponse, ChatSummary } from '../parser/types';

export interface AnalyzerState {
  status: 'idle' | 'analyzing' | 'done' | 'error';
  progress: number;
  progressStep: string;
  result: AnalysisResult | null;
  chat: ChatSummary | null;
  error: string | null;
}

const MAX_RETRIES = 3;

// Preload worker script on mount so first upload (zip or txt) doesn't hit a cold load
function useWorkerPreload() {
  useEffect(() => {
    const worker = new Worker(
      new URL('./analyzerWorker.ts', import.meta.url),
      { type: 'module' }
    );
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'ready') {
        worker.removeEventListener('message', onMessage);
        worker.terminate();
      }
    };
    worker.addEventListener('message', onMessage);
    return () => worker.terminate();
  }, []);
}

export function useAnalyzer() {
  useWorkerPreload();

  const [state, setState] = useState<AnalyzerState>({
    status: 'idle',
    progress: 0,
    progressStep: '',
    result: null,
    chat: null,
    error: null,
  });

  const workerRef = useRef<Worker | null>(null);
  const retriesRef = useRef(0);
  const pendingContentRef = useRef<string | null>(null);
  const startWorkerRef = useRef<(fileContent: string) => void>(() => {});

  const startWorker = useCallback((fileContent: string) => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    const worker = new Worker(
      new URL('./analyzerWorker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerResponse | { type: 'ready' }>) => {
      const msg = event.data;

      // Worker module loaded — now safe to send the file content
      if (msg.type === 'ready') {
        worker.postMessage({ type: 'analyze', fileContent });
        return;
      }

      switch (msg.type) {
        case 'progress':
          setState(prev => ({
            ...prev,
            progress: msg.percent,
            progressStep: msg.step,
          }));
          break;

        case 'result':
          setState({
            status: 'done',
            progress: 100,
            progressStep: 'Done!',
            result: msg.data,
            chat: msg.chat,
            error: null,
          });
          retriesRef.current = 0;
          worker.terminate();
          workerRef.current = null;
          break;

        case 'error':
          // Retry on first failure (cold module cache)
          if (retriesRef.current < MAX_RETRIES) {
            retriesRef.current++;
            worker.terminate();
            workerRef.current = null;
            startWorkerRef.current(fileContent);
            return;
          }
          setState({
            status: 'error',
            progress: 0,
            progressStep: '',
            result: null,
            chat: null,
            error: msg.message,
          });
          retriesRef.current = 0;
          worker.terminate();
          workerRef.current = null;
          break;
      }
    };

    worker.onerror = (err) => {
      // Retry on first failure (module compilation / load failure in dev)
      if (retriesRef.current < MAX_RETRIES) {
        retriesRef.current++;
        worker.terminate();
        workerRef.current = null;
        startWorkerRef.current(fileContent);
        return;
      }
      setState({
        status: 'error',
        progress: 0,
        progressStep: '',
        result: null,
        chat: null,
        error: err.message || 'An unknown error occurred in the worker.',
      });
      retriesRef.current = 0;
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    startWorkerRef.current = startWorker;
  }, [startWorker]);

  const analyze = useCallback((fileContent: string) => {
    pendingContentRef.current = fileContent;
    retriesRef.current = 0;

    setState({
      status: 'analyzing',
      progress: 0,
      progressStep: 'Starting...',
      result: null,
      chat: null,
      error: null,
    });

    startWorker(fileContent);
  }, [startWorker]);

  const reset = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    retriesRef.current = 0;
    pendingContentRef.current = null;
    setState({
      status: 'idle',
      progress: 0,
      progressStep: '',
      result: null,
      chat: null,
      error: null,
    });
  }, []);

  return { state, analyze, reset };
}
