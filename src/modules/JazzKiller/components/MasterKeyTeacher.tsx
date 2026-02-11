import { useState } from 'react';
import { usePracticeStore } from '../../../core/store/usePracticeStore';
import { getKeyShiftTip } from '../ai/jazzTeacherLogic';
import { Music, ChevronRight } from 'lucide-react';

const CYCLE_OF_FIFTHS = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'B', 'E', 'A', 'D', 'G'];

export function MasterKeyTeacher() {
  const { currentSong } = usePracticeStore();
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [teacherTip, setTeacherTip] = useState('');
  const [loading, setLoading] = useState(false);

  const currentKey = CYCLE_OF_FIFTHS[currentKeyIndex];
  const songTitle = currentSong?.title ?? 'this standard';

  const startNextKey = async () => {
    const nextIndex = (currentKeyIndex + 1) % 12;
    const targetKey = CYCLE_OF_FIFTHS[nextIndex];
    setCurrentKeyIndex(nextIndex);
    setTeacherTip('');
    setLoading(true);
    try {
      const advice = await getKeyShiftTip(songTitle, currentKey, targetKey);
      setTeacherTip(advice);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900/80 text-white rounded-2xl shadow-2xl border border-slate-700/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Music size={20} className="text-amber-400" />
          Master Key Routine
        </h3>
        <span className="px-3 py-1 bg-amber-500 text-black text-xs font-black rounded-full">
          CYCLE OF FIFTHS
        </span>
      </div>

      <div className="text-4xl font-black text-center my-8 text-amber-400">
        {currentKey} <span className="text-lg text-slate-500 font-normal">Major</span>
      </div>

      {teacherTip && (
        <div className="mb-6 p-4 bg-slate-800/80 rounded-lg border-l-4 border-amber-500 italic text-sm text-slate-200">
          &ldquo;{teacherTip}&rdquo;
        </div>
      )}

      {loading && (
        <div className="mb-6 py-4 text-center text-slate-500 text-sm">Thinking...</div>
      )}

      <button
        type="button"
        onClick={startNextKey}
        className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
      >
        Next key in cycle
        <ChevronRight size={18} />
      </button>

      <p className="mt-4 text-[10px] text-slate-500 text-center uppercase tracking-widest">
        Practicing like the masters: move through all 12 keys.
      </p>
    </div>
  );
}
