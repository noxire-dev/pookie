import { parseWhatsAppChat } from '../parser/whatsappParser';
import { analyzeBasicStats } from '../analyzers/basicStats';
import { analyzeTimeline } from '../analyzers/timeline';
import { analyzeLove } from '../analyzers/loveAnalysis';
import { analyzeEmojis } from '../analyzers/emojiAnalysis';
import { analyzeMedia } from '../analyzers/mediaStats';
import { analyzeMilestones } from '../analyzers/milestones';
import { analyzeWordCloud } from '../analyzers/wordCloud';
import { analyzeFunStats } from '../analyzers/funStats';
import type { WorkerRequest, WorkerResponse, AnalysisResult, ChatSummary } from '../parser/types';

// Signal that the module has loaded and the worker is ready
self.postMessage({ type: 'ready' });

function postProgress(step: string, percent: number) {
  const msg: WorkerResponse = { type: 'progress', step, percent };
  self.postMessage(msg);
}

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { type, fileContent } = event.data;

  if (type !== 'analyze') return;

  try {
    const t0 = performance.now();

    // Step 1: Parse the chat
    postProgress('Parsing chat...', 0);
    const chat = parseWhatsAppChat(fileContent, (percent) => {
      postProgress('Parsing chat...', Math.round(percent * 0.4)); // 0-40%
    });
    postProgress(`Parsed ${chat.totalMessages.toLocaleString()} messages`, 40);

    // Step 2: Run analyzers
    postProgress('Analyzing basic stats...', 45);
    const basicStats = analyzeBasicStats(chat);

    postProgress('Analyzing timeline...', 55);
    const timeline = analyzeTimeline(chat);

    postProgress('Analyzing love & affection...', 65);
    const loveAnalysis = analyzeLove(chat);

    postProgress('Analyzing emojis...', 72);
    const emojiAnalysis = analyzeEmojis(chat);

    postProgress('Analyzing media...', 80);
    const mediaStats = analyzeMedia(chat);

    postProgress('Finding milestones...', 85);
    const milestones = analyzeMilestones(chat);

    postProgress('Analyzing word frequency...', 88);
    const wordCloud = analyzeWordCloud(chat);

    postProgress('Analyzing fun stats...', 94);
    const funStats = analyzeFunStats(chat);

    const elapsed = Math.round(performance.now() - t0);
    postProgress(`Done in ${(elapsed / 1000).toFixed(1)}s!`, 100);

    const result: AnalysisResult = {
      basicStats,
      timeline,
      loveAnalysis,
      emojiAnalysis,
      mediaStats,
      milestones,
      wordCloud,
      funStats,
    };

    // Send only summary (not the full message array — way too expensive for 800K+ messages)
    const chatSummary: ChatSummary = {
      participants: chat.participants,
      startDate: chat.startDate,
      endDate: chat.endDate,
      totalMessages: chat.totalMessages,
    };

    const response: WorkerResponse = {
      type: 'result',
      data: result,
      chat: chatSummary,
    };
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      type: 'error',
      message: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(response);
  }
};
