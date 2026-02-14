import type { WordCloudResult } from '../parser/types';
import { useDisplayName } from '../contexts/NameContext';
import { ResultCard } from './ResultCard';

interface Props {
  data: WordCloudResult;
  participants: string[];
}

export function WordCloudCard({ data, participants }: Props) {
  const dn = useDisplayName();
  // Calculate max count for relative sizing
  const maxCount = data.topWords.length > 0 ? data.topWords[0].count : 1;

  return (
    <ResultCard title="Word Frequency" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4 H20 V16 H10 L6 20 V16 H4 Z"/></svg>}>
      <h3 className="subsection-title">Top 50 Words</h3>
      <div className="word-cloud">
        {data.topWords.map((w, i) => {
          const size = Math.max(0.7, (w.count / maxCount) * 2.5);
          return (
            <span
              key={i}
              className="word-cloud-word"
              style={{ fontSize: `${size}rem` }}
              title={`"${w.word}" — ${w.count.toLocaleString()} times`}
            >
              {w.word}
            </span>
          );
        })}
      </div>

      {participants.map(p => (
        <div key={p}>
          <h3 className="subsection-title">{dn(p)}'s Top Words</h3>
          <div className="word-list">
            {(data.perParticipant[p] || []).slice(0, 15).map((w, i) => (
              <div key={i} className="word-list-item">
                <span className="word-rank">#{i + 1}</span>
                <span className="word-text">{w.word}</span>
                <span className="word-count">{w.count.toLocaleString()}</span>
              </div>
            ))}
          </div>

          {(data.uniqueWords[p] || []).length > 0 && (
            <>
              <h4 className="subsection-title-small">Words Only {dn(p)} Uses</h4>
              <div className="unique-words">
                {(data.uniqueWords[p] || []).map((w, i) => (
                  <span key={i} className="unique-word">{w}</span>
                ))}
              </div>
            </>
          )}
        </div>
      ))}
    </ResultCard>
  );
}
