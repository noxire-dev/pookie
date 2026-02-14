import type { ReactNode } from 'react';

interface ResultCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function ResultCard({ title, icon, children }: ResultCardProps) {
  return (
    <div className="result-card">
      <h2 className="result-card-title">
        {icon && <span className="result-card-icon">{icon}</span>}
        {title}
      </h2>
      <div className="result-card-body">
        {children}
      </div>
    </div>
  );
}
