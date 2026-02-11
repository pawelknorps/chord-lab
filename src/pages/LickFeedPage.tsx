import React from 'react';
import { Link } from 'react-router-dom';
import { LickFeed } from '../components/LickFeed/LickFeed';

export default function LickFeedPage() {
  return (
    <div className="h-full overflow-auto p-6">
      <div className="mx-auto max-w-xl space-y-4">
        <div className="flex items-center gap-4">
          <Link
            to="/jazz-standards"
            className="text-sm font-medium text-amber-500 hover:text-amber-400"
          >
            ← Back to Standards
          </Link>
        </div>
        <LickFeed />
      </div>
    </div>
  );
}
