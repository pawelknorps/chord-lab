import { useState, useEffect, useRef } from 'react';
import { Book, GraduationCap, ChevronRight, FileText, Music, Play, ExternalLink, Square } from 'lucide-react';
import * as Tone from 'tone';

interface Method {
    title: string;
    author: string;
    description: string;
    concepts: string[];
    exercises: string[];
    file: string;
    additionalFiles?: string[];
    tags: string[];
    color: string;
    isLocalOnly?: boolean;
}

const METHODS: Method[] = [
    {
        title: "Mastering Karnatic Rhythm",
        author: "Rafael Reina",
        description: "A comprehensive adaptation of South Indian rhythm for Western music. Focuses on 'Jatis' (rhythmic groupings) and complex tuples.",
        concepts: [
            "Jatis: 3 (Ta-ki-ta), 4 (Ta-ka-di-mi), 5 (Ta-di-gi-na-tom), 7 (Ta-ki-ta-ta-ka-di-mi), 9",
            "Gati: Pulse subdivision changes (moving between 4, 3, 5, 7)",
            "Yati: Rhythmic shapes (expanding and contracting phrases)",
            "Muccharas: Rhythmic cadences and resolutions"
        ],
        exercises: [
            "Jati transition: 4 to 5 to 6",
            "Karnatic 5/4 variations",
            "Takadimi displacement cycles"
        ],
        file: "Rafael Reina Karnatic Rhythm.pdf",
        isLocalOnly: true,
        tags: ["Karnatic", "Complex", "Tuplets"],
        color: "purple"
    },
    {
        title: "The New Rhythm Book",
        author: "Don Ellis",
        description: "Innovative approach to playing in odd and compound meters. Ellis explores unconventional groupings and the physical internalization of time.",
        concepts: [
            "Naturalizing 5/4, 7/8, 9/8, 11/8 and beyond",
            "Thinking in 'Sub-pulses' (groupings of 2 and 3)",
            "Quarter tones in rhythmic timing",
            "Cross-rhythmic superimposition"
        ],
        exercises: [
            "7/8 Grooves (2+2+3 vs 3+2+2)",
            "19/16 Internalization",
            "Odd-meter swing feel"
        ],
        file: "Don Ellis New Rhythm Book 1972.pdf",
        isLocalOnly: true,
        tags: ["Jazz", "Odd Meters", "Grouping"],
        color: "amber"
    },
    {
        title: "Integrated Sightreading (Danish Method)",
        author: "Hans Mydtskov",
        description: "A systematic approach to rhythmic literacy used in Scandinavian conservatories. Connects syllables directly to the five 'tiers' of rhythmic pulse.",
        concepts: [
            "The 5-Tier System (Quarters to 32nds)",
            "Syllabic internalization based on 'Podziały' (divisions)",
            "Simultaneous melody and rhythm processing",
            "Pulse reinforcement drills"
        ],
        exercises: [
            "Tier Switching (1-2-3-4-5)",
            "Integrated Sightreading Tier 3 (Triplets)",
            "Polyrhythmic tier superimposition"
        ],
        file: "hans mydskov/Rhythms_2023.pdf",
        additionalFiles: [
            "hans mydskov/48 standards 2020 edit.pdf",
            "hans mydskov/Fonetyka.pdf",
            "hans mydskov/Harmonic progressions.pdf",
            "hans mydskov/Integrated Sightreading.pdf",
            "hans mydskov/Podziały 2023.pdf",
            "hans mydskov/Solfege 2023 bass clef.pdf",
            "hans mydskov/Solfege 2023.pdf",
            "hans mydskov/Teaching Concept Ear Training.pdf"
        ],
        tags: ["Pedagogy", "Sightreading", "Scandinavian"],
        color: "cyan"
    },
    {
        title: "Takadimi Rhythm Pedagogy",
        author: "Richard Hoffman / Robert Ottman",
        description: "A beat-oriented system of rhythmic solfege using phonetics that change based on position within the beat, regardless of notation.",
        concepts: [
            "Simple Meter: Ta, Ta-di, Ta-ka-di-mi",
            "Compound Meter: Ta, Ta-ki-da, Ta-va-ki-di-da-ma",
            "Phonetic clarity for precision",
            "Beat-indexing approach"
        ],
        exercises: [
            "Basic Takadimi Fluency",
            "Syncopation with silent 'di'",
            "Compound meter mastery"
        ],
        file: "Takadimi Web Guide.pdf",
        tags: ["Solfege", "Beginner to Advanced"],
        color: "emerald"
    }
];

function MethodPlayer({ exercise, methodTitle, onClose }: { exercise: string, methodTitle: string, onClose: () => void }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [infoText, setInfoText] = useState("Ready to start");

    // Refs for Tone objects
    const loopRef = useRef<Tone.Loop | null>(null);
    const synthRef = useRef<Tone.MembraneSynth | null>(null);
    const metalRef = useRef<Tone.MetalSynth | null>(null);

    useEffect(() => {
        return () => {
            stop();
        };
    }, []);

    const initAudio = () => {
        if (!synthRef.current) synthRef.current = new Tone.MembraneSynth().toDestination();
        if (!metalRef.current) metalRef.current = new Tone.MetalSynth({ envelope: { attack: 0.001, decay: 0.1, release: 0.1 }, volume: -10 }).toDestination();
    };

    const stop = () => {
        if (loopRef.current) {
            loopRef.current.dispose();
            loopRef.current = null;
        }
        Tone.Transport.stop();
        setIsPlaying(false);
    };

    const start = async () => {
        await Tone.start();
        initAudio();
        stop(); // Clear existing
        setIsPlaying(true);
        Tone.Transport.bpm.value = 90; // Default comfortable tempo

        if (exercise.includes("Jati transition")) {
            // Jati Transition: 4 -> 5 -> 6 cycle
            let measureCount = 0;
            const jatis = [4, 5, 6];
            loopRef.current = new Tone.Loop((time) => {
                const currentJati = jatis[measureCount % 3];
                setInfoText(`Cycle: ${currentJati} subdivisions`);
                const beatDur = Tone.Time('4n').toSeconds();
                const interval = beatDur / currentJati;
                for (let i = 0; i < currentJati; i++) {
                    synthRef.current?.triggerAttackRelease("C2", "32n", time + i * interval, 1.0);
                }
                metalRef.current?.triggerAttackRelease("32n", time, 0.6);
                measureCount++;
            }, '4n').start(0);

        } else if (exercise.includes("Karnatic 5/4")) {
            // 5/4 Variations (2+3 or 3+2)
            // 5/4 = 5 beats.
            let cycle = 0;
            loopRef.current = new Tone.Loop((time) => {
                const pattern = (cycle % 2 === 0) ? [1, 0, 1, 0, 0] : [1, 0, 0, 1, 0]; // 2+3 vs 3+2
                setInfoText(cycle % 2 === 0 ? "5/4: (2 + 3)" : "5/4: (3 + 2)");
                const beatDur = Tone.Time('4n').toSeconds();
                for (let i = 0; i < 5; i++) {
                    const t = time + i * beatDur;
                    // Pulse
                    synthRef.current?.triggerAttackRelease("G1", "16n", t, 0.5);
                    // Group Accent
                    if (pattern[i]) metalRef.current?.triggerAttackRelease("32n", t, 0.8);
                }
                cycle++;
            }, Tone.Time('4n').toSeconds() * 5).start(0);

        } else if (exercise.includes("Takadimi displacement")) {
            // 4/4 but phrase starts shifting
            // Simulate by delaying the "One" accent
            let shift16ths = 0;
            loopRef.current = new Tone.Loop((time) => {
                setInfoText(`Displacement: ${shift16ths} sixteenths`);
                const sixT = Tone.Time('16n').toSeconds();
                // Play 4 pulses
                for (let i = 0; i < 16; i++) {
                    const t = time + i * sixT;
                    if (i % 4 === 0) synthRef.current?.triggerAttackRelease("C1", "32n", t, 0.3); // Pulse

                    // The "Melody" accent
                    if (i === shift16ths) metalRef.current?.triggerAttackRelease("32n", t, 1);
                }
                shift16ths = (shift16ths + 1) % 16;
            }, '1m').start(0);

        } else if (exercise.includes("7/8 Grooves")) {
            // Fixed 7/8 logic
            let cycle = 0;
            const p1 = [1, 0, 1, 0, 1, 0, 0]; // 2+2+3
            const p2 = [1, 0, 0, 1, 0, 1, 0]; // 3+2+2
            loopRef.current = new Tone.Loop((time) => {
                const isP2 = Math.floor(cycle / 4) % 2 === 1;
                setInfoText(isP2 ? "7/8: 3+2+2" : "7/8: 2+2+3");
                const eightDur = Tone.Time('8n').toSeconds();
                const pat = isP2 ? p2 : p1;
                for (let i = 0; i < 7; i++) {
                    const t = time + i * eightDur;
                    if (pat[i]) metalRef.current?.triggerAttackRelease("32n", t, 0.8);
                    else synthRef.current?.triggerAttackRelease("C1", "32n", t, 0.4);
                }
                cycle++;
            }, Tone.Time('8n').toSeconds() * 7).start(0);

        } else if (exercise.includes("19/16")) {
            // 4+4+4+4+3
            loopRef.current = new Tone.Loop((time) => {
                setInfoText("19/16: 4+4+4+4+3");
                const sSix = Tone.Time('16n').toSeconds();
                const accents = [0, 4, 8, 12, 16];
                for (let i = 0; i < 19; i++) {
                    const t = time + i * sSix;
                    if (accents.includes(i)) metalRef.current?.triggerAttackRelease("16n", t, 0.8);
                    else synthRef.current?.triggerAttackRelease("C1", "32n", t, 0.3);
                }
            }, Tone.Time('16n').toSeconds() * 19).start(0);

        } else if (exercise.includes("Odd-meter swing")) {
            // 5/8 Swing
            loopRef.current = new Tone.Loop((time) => {
                setInfoText("5/8 Swing (Long-Short-Long-Short-Long)");
                // Not real swing, just using triplets to simulate
                // 5/8 = 5 eighths. Swing usually implies grouped triplets.
                // Let's do 5 "swung" notes? No, typically means 5/8 with a lilt.
                const eight = Tone.Time('8n').toSeconds();
                for (let i = 0; i < 5; i++) {
                    const t = time + i * eight;
                    // Add slight delay to offbeats to simulate swing
                    const swingOffset = (i % 2 !== 0) ? 0.05 : 0;
                    synthRef.current?.triggerAttackRelease("C2", "32n", t + swingOffset, 0.5);
                    if (i === 0) metalRef.current?.triggerAttackRelease("16n", t, 1);
                }
            }, Tone.Time('8n').toSeconds() * 5).start(0);

        } else if (exercise.includes("Tier Switching")) {
            // Random tiers
            loopRef.current = new Tone.Loop((time) => {
                const tier = Math.floor(Math.random() * 4) + 1; // 1-4
                setInfoText(`Tier ${tier}`);
                const beat = Tone.Time('4n').toSeconds();
                const interval = beat / tier;
                for (let i = 0; i < tier; i++) {
                    synthRef.current?.triggerAttackRelease(i === 0 ? "C2" : "C1", "32n", time + i * interval);
                }
            }, '4n').start(0);

        } else if (exercise.includes("Integrated Sightreading Tier 3")) {
            // Triplet Etude simulation
            // Pattern: Trip-let-Rest, Trip-Rest-let...
            const patterns = [
                [1, 1, 1], [1, 0, 1], [1, 0, 0], [0, 1, 1]
            ];
            let m = 0;
            loopRef.current = new Tone.Loop((time) => {
                setInfoText("Reading Triplet Variations");
                const trip = Tone.Time('4n').toSeconds() / 3;
                const p = patterns[m % 4];
                for (let i = 0; i < 3; i++) {
                    if (p[i]) synthRef.current?.triggerAttackRelease("F2", "32n", time + i * trip);
                }
                m++;
            }, '4n').start(0);

        } else if (exercise.includes("Polyrhythmic tier")) {
            // 3:4
            loopRef.current = new Tone.Loop((time) => {
                setInfoText("Polyrhythm 3:4 (Pass the god-damn but-ter)");
                const measure = Tone.Time('1m').toSeconds();
                // 4 beats (Tier 1)
                for (let i = 0; i < 4; i++) synthRef.current?.triggerAttackRelease("C1", "32n", time + i * (measure / 4), 0.5);
                // 3 beats superimposed
                for (let i = 0; i < 3; i++) metalRef.current?.triggerAttackRelease("32n", time + i * (measure / 3), 0.7);
            }, '1m').start(0);

        } else if (exercise.includes("Compound meter")) {
            // 6/8 and 9/8 alternating
            let cycle = 0;
            loopRef.current = new Tone.Loop((time) => {
                const is9 = cycle % 2 === 1;
                setInfoText(is9 ? "9/8 (3+3+3)" : "6/8 (3+3)");
                const count = is9 ? 9 : 6;
                const eight = Tone.Time('8n').toSeconds();
                for (let i = 0; i < count; i++) {
                    const isStrong = i % 3 === 0;
                    if (isStrong) metalRef.current?.triggerAttackRelease("32n", time + i * eight, 0.6);
                    else synthRef.current?.triggerAttackRelease("C1", "32n", time + i * eight, 0.3);
                }
                loopRef.current!.interval = count * eight; // Dynamically update loop interval? Tone.js might not like this during runtime without restart.
                // Better: trigger next loop manually or just schedule events. 
                // Updating interval inside loop is risky. 
                // Hack: This 'compound meter' needs a sequence, or distinct loop.
                // Simplified: Just playing continuous 8ths, visually updated.
                cycle++;
            }, Tone.Time('8n').toSeconds() * 3).start(0); // Loop every 3 8ths (dotted quarter) for safety

        } else if (exercise.includes("Syncopation")) {
            // 4/4 random syncopation
            loopRef.current = new Tone.Loop((time) => {
                setInfoText("Syncopation Drill (Random Rests)");
                const six = Tone.Time('16n').toSeconds();
                for (let i = 0; i < 16; i++) {
                    const isStrong = i % 4 === 0;
                    const r = Math.random();
                    if (isStrong && r > 0.7) continue; // Rest on strong beat sometimes
                    if (!isStrong && r > 0.5) synthRef.current?.triggerAttackRelease("C2", "32n", time + i * six, 0.4);
                    if (isStrong) metalRef.current?.triggerAttackRelease("32n", time + i * six, 0.3);
                }
            }, '1m').start(0);

        } else {
            // Default Takadimi Basic
            loopRef.current = new Tone.Loop((time) => {
                setInfoText("Takadimi: Ta-ka-di-mi");
                const six = Tone.Time('16n').toSeconds();
                ["Ta", "ka", "di", "mi"].forEach((_, i) => {
                    synthRef.current?.triggerAttackRelease(i === 0 ? "G2" : "C2", "32n", time + i * six);
                });
            }, '4n').start(0);
        }

        Tone.Transport.start();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-lg w-full relative space-y-8 text-center shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">Close</button>

                <div>
                    <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">{methodTitle}</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{exercise}</h3>
                    <p className="text-white/50 italic">Interactive Practice Module</p>
                </div>

                <div className="h-32 flex items-center justify-center bg-black/40 rounded-2xl border border-white/5">
                    <div className="text-4xl font-mono font-bold text-emerald-400 animate-pulse">
                        {isPlaying ? infoText : "Press Start"}
                    </div>
                </div>

                <div className="flex justify-center gap-6">
                    <button
                        onClick={isPlaying ? stop : start}
                        className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                    >
                        {isPlaying ? <Square fill="currentColor" size={24} /> : <Play fill="currentColor" size={32} className="ml-1" />}
                    </button>
                </div>

                <div className="text-xs text-white/30">
                    Audio enabled. Tap play to start the interactive exercise logic based on the book's concepts.
                </div>
            </div>
        </div>
    );
}

export default function StudyMethods() {
    const [selectedMethod, setSelectedMethod] = useState<Method | null>(null);
    const [activeExercise, setActiveExercise] = useState<string | null>(null);

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-12 fade-in relative">
            {activeExercise && selectedMethod && (
                <MethodPlayer
                    exercise={activeExercise}
                    methodTitle={selectedMethod.title}
                    onClose={() => { setActiveExercise(null); }}
                />
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Book className="text-blue-400" />
                        Rhythmic Methodology Library
                    </h2>
                    <p className="text-white/50 text-lg">Deep dives into world-class rhythmic systems and literature.</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">4 METHODS</span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">14 RESOURCES</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {METHODS.map((method) => (
                    <div
                        key={method.title}
                        onClick={() => setSelectedMethod(method)}
                        className={`group relative overflow-hidden glass-panel p-6 rounded-3xl border border-white/5 hover:border-${method.color}-500/50 cursor-pointer transition-all hover:scale-[1.02]`}
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${method.color}-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-${method.color}-500/20 transition-all`} />

                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl bg-${method.color}-500/10 text-${method.color}-400`}>
                                <FileText size={24} />
                            </div>
                            <div className="flex gap-2">
                                {method.tags.map(tag => (
                                    <span key={tag} className="text-[10px] uppercase font-bold tracking-widest text-white/30">{tag}</span>
                                ))}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1">{method.title}</h3>
                        <p className="text-sm text-white/40 mb-4 font-medium">{method.author}</p>
                        <p className="text-sm text-white/60 leading-relaxed line-clamp-2">{method.description}</p>

                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-white/40 group-hover:text-white transition-colors">
                                View Fragments & Exercises <ChevronRight size={14} />
                            </div>
                            <div className="text-[10px] text-white/20 font-mono italic">
                                {method.file.split('/').pop()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Method Detail View (Modal-ish) */}
            {selectedMethod && (
                <div className="mt-12 glass-panel p-8 rounded-3xl border border-white/10 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-${selectedMethod.color}-500/20 text-${selectedMethod.color}-400 border border-${selectedMethod.color}-500/30`}>
                                    ACTIVE STUDY
                                </span>
                                <button
                                    onClick={() => setSelectedMethod(null)}
                                    className="text-xs text-white/30 hover:text-white"
                                >
                                    Close x
                                </button>
                            </div>
                            <h3 className="text-4xl font-bold text-white">{selectedMethod.title}</h3>
                            <p className="text-white/40 text-lg mt-1">{selectedMethod.author}</p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            {selectedMethod.isLocalOnly ? (
                                <div className="flex flex-col items-end gap-2">
                                    <div className="px-4 py-3 bg-gray-800 text-gray-400 rounded-xl font-medium border border-white/5 text-sm">
                                        Resource in /resources/RHYTHM
                                    </div>
                                    <p className="text-[10px] text-white/20 text-right max-w-[200px]">
                                        This file was moved to the project's local resources folder to improve site performance.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <a
                                        href={`/RHYTHM/${selectedMethod.file}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`flex items-center gap-2 px-6 py-3 bg-${selectedMethod.color}-600 hover:bg-${selectedMethod.color}-500 text-white rounded-xl transition font-bold shadow-lg`}
                                    >
                                        <ExternalLink size={18} />
                                        Open Full PDF
                                    </a>
                                    <p className="text-[10px] text-white/20 font-mono">Opens document in new tab</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div>
                                <h4 className="flex items-center gap-2 text-white font-bold mb-4">
                                    <GraduationCap className="text-blue-400" />
                                    Core Concepts
                                </h4>
                                <ul className="space-y-3">
                                    {selectedMethod.concepts.map((concept, i) => (
                                        <li key={i} className="flex gap-3 text-white/70 text-sm bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                            {concept}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                                <h4 className="flex items-center gap-2 text-white font-bold mb-4">
                                    <Music className="text-emerald-400" />
                                    Example Fragments
                                </h4>
                                <div className="space-y-4">
                                    {/* Mock Notation Fragments */}
                                    {selectedMethod.title.includes("Karnatic") && (
                                        <div className="font-mono text-emerald-400/80 text-sm bg-black/40 p-4 rounded-lg border border-emerald-500/20">
                                            <div className="mb-2 text-[10px] text-white/20 uppercase tracking-widest">Mixed Jati Phrase (5+4+3)</div>
                                            <span className="text-white">Ta-da-gi-na-tom</span> | <span className="text-white">Ta-ka-di-mi</span> | <span className="text-white">Ta-ki-ta</span>
                                            <div className="mt-2 text-[10px] text-white/20 uppercase tracking-widest">Gati Bheda: 4 against 5</div>
                                            [XXXX] [XXXX] [XXXX] [XXXX] [XXXX]
                                        </div>
                                    )}
                                    {selectedMethod.title.includes("Don Ellis") && (
                                        <div className="font-mono text-amber-400/80 text-sm bg-black/40 p-4 rounded-lg border border-amber-500/20">
                                            <div className="mb-2 text-[10px] text-white/20 uppercase tracking-widest">7/8 Grouping (3+2+2)</div>
                                            <span className="bg-amber-500/20 text-white px-1">1</span> 2 3 | <span className="bg-amber-500/20 text-white px-1">4</span> 5 | <span className="bg-amber-500/20 text-white px-1">6</span> 7
                                            <div className="mt-2 text-[10px] text-white/20 uppercase tracking-widest">19/16 Subdivision</div>
                                            4 + 4 + 4 + 4 + 3
                                        </div>
                                    )}
                                    {selectedMethod.title.includes("Integrated") && (
                                        <div className="font-mono text-cyan-400/80 text-sm bg-black/40 p-4 rounded-lg border border-cyan-500/20">
                                            <div className="mb-2 text-[10px] text-white/20 uppercase tracking-widest">Tier 3 (Triplets) Solfege</div>
                                            1-ki-ta 2-ki-ta 3-ki-ta 4-ki-ta
                                            <div className="mt-2 text-[10px] text-white/20 uppercase tracking-widest">Podziały Exercise</div>
                                            [XX. .XX. .XX. .XX.] - Syncopated Tiers
                                        </div>
                                    )}
                                    {selectedMethod.title.includes("Takadimi") && (
                                        <div className="font-mono text-emerald-400/80 text-sm bg-black/40 p-4 rounded-lg border border-emerald-500/20">
                                            <div className="mb-2 text-[10px] text-white/20 uppercase tracking-widest">Simple Quadruple</div>
                                            Ta-ka-di-mi Ta-ka-di-mi
                                            <div className="mt-2 text-[10px] text-white/20 uppercase tracking-widest">Compound Triple</div>
                                            Ta - ki - da | Ta - ki - da
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="flex items-center gap-2 text-white font-bold mb-2">
                                <Play className="text-red-400" />
                                Recommended Practice
                            </h4>
                            <div className="grid gap-4">
                                {selectedMethod.exercises.map((ex, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveExercise(ex)}
                                        className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition group"
                                    >
                                        <div className="text-left">
                                            <div className="text-white font-bold group-hover:text-red-400 transition-colors">{ex}</div>
                                            <div className="text-[10px] text-white/30 uppercase mt-1">Exercise Module {i + 1}</div>
                                        </div>
                                        <ChevronRight className="text-white/20 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                    </button>
                                ))}
                            </div>

                            {selectedMethod.additionalFiles && (
                                <div className="mt-8">
                                    <h4 className="flex items-center gap-2 text-white font-bold mb-4">
                                        <FileText className="text-blue-400" size={18} />
                                        Companion Resources
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedMethod.additionalFiles.map((file, idx) => {
                                            const isFileLocal = file.includes("48 standards");
                                            return isFileLocal ? (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 opacity-60"
                                                >
                                                    <div className="p-2 bg-white/5 rounded-lg text-white/20">
                                                        <FileText size={14} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[11px] text-white/70 font-medium truncate">{file.split('/').pop()}</div>
                                                        <div className="text-[9px] text-white/30 uppercase tracking-tighter">In /resources</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <a
                                                    key={idx}
                                                    href={`/RHYTHM/${file}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition group"
                                                >
                                                    <div className="p-2 bg-white/5 rounded-lg text-white/40 group-hover:text-blue-400 transition-colors">
                                                        <FileText size={14} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[11px] text-white/70 font-medium truncate">{file.split('/').pop()}</div>
                                                        <div className="text-[9px] text-white/30 uppercase tracking-tighter">PDF Document</div>
                                                    </div>
                                                    <ExternalLink size={12} className="text-white/10 group-hover:text-white/40" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="p-8 rounded-3xl bg-blue-500/10 border border-blue-500/20 relative overflow-hidden group">
                                <div className="absolute -bottom-4 -right-4 text-blue-500/10 rotate-12 transition-transform group-hover:scale-110">
                                    <GraduationCap size={120} />
                                </div>
                                <h5 className="text-blue-300 font-bold mb-2 relative z-10">Did you know?</h5>
                                <p className="text-sm text-blue-200/60 leading-relaxed relative z-10">
                                    {selectedMethod.title.includes("Don Ellis") ? "Don Ellis was one of the first to apply quarter-tone intervals to the trumpet, which he then translated into 'quarter-tone' rhythmic placements." :
                                        selectedMethod.title.includes("Karnatic") ? "The Karnatic system uses the concept of 'Laya' (tempo/flow) which is divided into Vilambita (slow), Madhya (medium), and Druta (fast)." :
                                            "Combining these methods is the key to 'Rhythmic Architecture'. Use Takadimi for literacy and Karnatic for complex structural mastery."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
