import type { AnalysisResult, ChatSummary } from '../parser/types';
import { useDisplayName } from '../contexts/NameContext';
import { BasicStatsCard } from './BasicStatsCard';
import { TimelineCard } from './TimelineCard';
import { LoveAnalysisCard } from './LoveAnalysisCard';
import { EmojiAnalysisCard } from './EmojiAnalysisCard';
import { MediaStatsCard } from './MediaStatsCard';
import { MilestonesCard } from './MilestonesCard';
import { WordCloudCard } from './WordCloudCard';
import { FunStatsCard } from './FunStatsCard';

interface Props {
  result: AnalysisResult;
  chat: ChatSummary;
}

export function Results({ result, chat }: Props) {
  const dn = useDisplayName();

  return (
    <div className="results">
      <div className="results-header">
        <h2>Chat Analysis Results</h2>
        <p className="results-summary">
          {chat.participants.map(dn).join(' & ')} — {chat.totalMessages.toLocaleString()} messages
          from {new Date(chat.startDate).toLocaleDateString('en-GB')} to {new Date(chat.endDate).toLocaleDateString('en-GB')}
        </p>
      </div>

      <BasicStatsCard data={result.basicStats} />
      <FunStatsCard data={result.funStats} participants={chat.participants} />
      <TimelineCard data={result.timeline} participants={chat.participants} />
      <LoveAnalysisCard data={result.loveAnalysis} participants={chat.participants} />
      <EmojiAnalysisCard data={result.emojiAnalysis} />
      <MediaStatsCard data={result.mediaStats} participants={chat.participants} />
      <MilestonesCard data={result.milestones} />
      <WordCloudCard data={result.wordCloud} participants={chat.participants} />
    </div>
  );
}
