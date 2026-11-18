import { useState } from 'react';
import { ALERTS } from '../data.js';

export default function Alerts() {
  const [read, setRead] = useState(() => new Set());
  return (
    <ul className="divide-y divide-gray-100">
      {ALERTS.map(a => {
        const isRead = read.has(a.id);
        return (
          <li key={a.id}>
            <button type="button" onClick={() => setRead(s => new Set(s).add(a.id))}
              className="flex w-full items-center gap-3 px-4 py-4 text-left transition active:bg-gray-50">
              <span className={`h-2 w-2 shrink-0 rounded-full ${isRead ? 'bg-transparent' : 'bg-brand'}`} aria-label={isRead ? '읽음' : '읽지 않음'} />
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-[15px] ${isRead ? 'text-gray-400' : 'font-medium'}`}>{a.text}</span>
                <span className="mt-0.5 block text-xs text-gray-400">{a.time}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
