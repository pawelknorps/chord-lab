/**
 * QuestionAnswerCoordinator – Call-and-response between band members.
 *
 * Tracks the previous bar's "question" (distinctive rhythm from one instrument)
 * and with some probability selects a "responder" instrument to play an
 * answering rhythm motive (echo, complement, or space).
 */

export type BandRole = 'piano' | 'bass' | 'drums';

export type AnswerType = 'echo' | 'complement' | 'space';

export interface LastBarSummary {
    piano: { patternName: string; stepCount: number };
    drums: { wasFill: boolean; hitCount: number };
    bass: { hadPush: boolean; hadSkip: boolean };
}

export interface AnswerDecision {
    doAnswer: boolean;
    responder: BandRole;
    questionFrom: BandRole;
    answerType: AnswerType;
}

/** Base probability that a bar will be an "answer" to the previous bar's rhythm. */
const ANSWER_PROBABILITY = 0.32;

/** Cooldown: don't answer again for this many bars after an answer. */
const ANSWER_COOLDOWN_BARS = 1;

/** Minimum "distinctiveness" for a bar to count as a question (e.g. piano steps, drum hits). */
const MIN_QUESTION_STEPS = 2;
const MIN_QUESTION_DRUM_HITS = 6;
const QUESTION_IF_FILL = true;

export class QuestionAnswerCoordinator {
    private lastAnswerBar: number = -10;
    private lastQuestionFrom: BandRole | null = null;

    /**
     * Decide whether the current bar should be an "answer" to the previous bar,
     * and if so, which instrument answers and with what type.
     */
    getResponse(barIndex: number, lastBar: LastBarSummary | null): AnswerDecision {
        const defaultDecision: AnswerDecision = {
            doAnswer: false,
            responder: 'piano',
            questionFrom: 'piano',
            answerType: 'complement',
        };

        if (!lastBar) return defaultDecision;

        // Cooldown: avoid back-to-back answers
        if (barIndex <= this.lastAnswerBar + ANSWER_COOLDOWN_BARS) {
            return defaultDecision;
        }

        // Who "asked" the question? (who had a distinctive rhythm last bar?)
        const questionFrom = this.selectQuestionSource(lastBar);
        if (questionFrom === null) return defaultDecision;

        // With probability, someone else answers
        if (Math.random() > ANSWER_PROBABILITY) return defaultDecision;

        const responder = this.pickResponder(questionFrom);
        const answerType = this.pickAnswerType(questionFrom, responder, lastBar);

        this.lastAnswerBar = barIndex;
        this.lastQuestionFrom = questionFrom;

        return {
            doAnswer: true,
            responder,
            questionFrom,
            answerType,
        };
    }

    /** Determine which instrument had a distinctive "question" rhythm last bar. */
    private selectQuestionSource(lastBar: LastBarSummary): BandRole | null {
        const candidates: BandRole[] = [];

        if (
            lastBar.piano.stepCount >= MIN_QUESTION_STEPS &&
            lastBar.piano.patternName &&
            lastBar.piano.patternName !== 'Sustain' &&
            lastBar.piano.patternName !== 'BalladPad'
        ) {
            candidates.push('piano');
        }
        if (
            lastBar.drums.wasFill ||
            (lastBar.drums.hitCount >= MIN_QUESTION_DRUM_HITS && QUESTION_IF_FILL)
        ) {
            candidates.push('drums');
        }
        if (lastBar.bass.hadPush || lastBar.bass.hadSkip) {
            candidates.push('bass');
        }

        if (candidates.length === 0) return null;
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    /** Pick an instrument to answer (must be different from question source). */
    private pickResponder(questionFrom: BandRole): BandRole {
        const others: BandRole[] = (['piano', 'bass', 'drums'] as BandRole[]).filter(
            (r) => r !== questionFrom
        );
        return others[Math.floor(Math.random() * others.length)];
    }

    /** Choose answer character: echo (mirror), complement (fill gaps), or space (lay out). */
    private pickAnswerType(
        questionFrom: BandRole,
        responder: BandRole,
        _lastBar: LastBarSummary
    ): AnswerType {
        const r = Math.random();
        // Slight bias: complement is most common, then echo, then space
        if (r < 0.5) return 'complement';
        if (r < 0.8) return 'echo';
        return 'space';
    }
}
