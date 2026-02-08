import type { Progression } from '../core/theory';

export interface JazzStandard extends Progression {
    key: string;
    style: 'Swing' | 'Bossa' | 'Ballad';
    tempo: number;
}

export const JAZZ_STANDARDS: JazzStandard[] = [
    // --- MODAL JAZZ ---
    {
        name: 'So What',
        genre: 'Modal Jazz',
        key: 'Dm',
        style: 'Swing',
        tempo: 140,
        degrees: [],
        description: 'Miles Davis. Pure Dorian mode.',
        chords: ['Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7',
            'Ebm7', 'Ebm7', 'Ebm7', 'Ebm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7']
    },
    {
        name: 'Maiden Voyage',
        genre: 'Modal Jazz',
        key: 'D',
        style: 'Swing',
        tempo: 120,
        degrees: [],
        description: 'Herbie Hancock. Sus chords planing.',
        chords: ['D9sus4', 'D9sus4', 'D9sus4', 'D9sus4', 'F9sus4', 'F9sus4', 'Eb9sus4', 'Eb9sus4',
            'Db9sus4', 'Db9sus4', 'Db9sus4', 'Db9sus4', 'D9sus4', 'D9sus4', 'D9sus4', 'D9sus4']
    },
    {
        name: 'Impressions',
        genre: 'Modal Jazz',
        key: 'Dm',
        style: 'Swing',
        tempo: 200,
        degrees: [],
        description: 'Coltrane. So What changes, fast.',
        chords: ['Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7',
            'Ebm7', 'Ebm7', 'Ebm7', 'Ebm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7']
    },

    // --- BOSSA NOVA ---
    {
        name: 'Blue Bossa',
        genre: 'Bossa Nova',
        key: 'Cm',
        style: 'Bossa',
        tempo: 130,
        degrees: [],
        description: 'Kenny Dorham. Intro to minor bossa.',
        chords: ['Cm7', 'Cm7', 'Fm7', 'Bb7', 'Dm7b5', 'G7alt', 'Cm7', 'Cm7',
            'Ebm7', 'Ab7', 'Dbmaj7', 'Dbmaj7', 'Dm7b5', 'G7alt', 'Cm7', 'Dm7b5/G7alt']
    },
    {
        name: 'Girl From Ipanema',
        genre: 'Bossa Nova',
        key: 'F',
        style: 'Bossa',
        tempo: 120,
        degrees: [],
        description: 'Jobim. The Bossa Nova anthem.',
        chords: ['Fmaj7', 'Fmaj7', 'G7', 'G7', 'Gm7', 'Gb7', 'Fmaj7', 'Gb7',
            'Gbmaj7', 'B7', 'F#m7', 'D7', 'Gm7', 'Eb7', 'Am7', 'D7b9']
    },
    {
        name: 'Wave',
        genre: 'Bossa Nova',
        key: 'D',
        style: 'Bossa',
        tempo: 120,
        degrees: [],
        description: 'Jobim. Advanced movement.',
        chords: ['Dmaj7', 'Bbdim7', 'Am7', 'D7b9', 'Gmaj7', 'Gm6', 'F#13', 'B7b9',
            'E9', 'Bb7', 'A7alt', 'Dmaj7']
    },

    // --- BALLADS ---
    {
        name: 'Body and Soul',
        genre: 'Ballad',
        key: 'Db',
        style: 'Ballad',
        tempo: 60,
        degrees: [],
        description: 'The ultimate ballad test.',
        chords: ['Ebm7', 'Bb7alt', 'Fm7', 'Edim7', 'Ebm7', 'Ab7', 'Dbmaj7', 'Gb7',
            'Fm7', 'E7', 'Ebm7', 'D7', 'Dbmaj7', 'F7alt', 'Bbm7', 'A7']
    },
    {
        name: 'Misty',
        genre: 'Ballad',
        key: 'Eb',
        style: 'Ballad',
        tempo: 65,
        degrees: [],
        description: 'Erroll Garner. Rich harmony.',
        chords: ['Ebmaj7', 'Bbm7/Eb7', 'Abmaj7', 'Abm7/Db7', 'Ebmaj7', 'Cm7', 'Fm7', 'Bb7',
            'Gm7', 'C7', 'Fm7', 'Bb7', 'Ebmaj7', 'Fm7/Bb7', 'Ebmaj7', 'Bb7']
    },
    {
        name: 'In A Sentimental Mood',
        genre: 'Ballad',
        key: 'F',
        style: 'Ballad',
        tempo: 70,
        degrees: [],
        description: 'Ellington. Minor atmosphere.',
        chords: ['Fm', 'Fm(maj7)', 'Fm7', 'Fm6', 'Bbm7', 'Eb7', 'Abmaj7', 'Dbmaj7',
            'Dm7b5', 'G7alt', 'Cm7', 'F7', 'Bbm7', 'Eb7', 'Abmaj7', 'C7alt']
    },

    // --- BEBOP & STANDARD ---
    {
        name: 'Oleo',
        genre: 'Bebop',
        key: 'Bb',
        style: 'Swing',
        tempo: 220,
        degrees: [],
        description: 'Sonny Rollins. Rhythm Changes.',
        chords: ['Bbmaj7/G7', 'Cm7/F7', 'Bbmaj7/G7', 'Cm7/F7', 'Fm7/Bb7', 'Ebmaj7/Ab7', 'Dm7/G7', 'Cm7/F7',
            'D7', 'D7', 'G7', 'G7', 'C7', 'C7', 'F7', 'F7']
    },
    {
        name: 'Autumn Leaves',
        genre: 'Jazz',
        key: 'Gm',
        style: 'Swing',
        tempo: 140,
        degrees: [],
        description: 'Classic ii-V-I study.',
        chords: ['Cm7', 'F7', 'Bbmaj7', 'Ebmaj7', 'Am7b5', 'D7alt', 'Gm6', 'Gm6',
            'Cm7', 'F7', 'Bbmaj7', 'Ebmaj7', 'Am7b5', 'D7alt', 'Gm6', 'Gm6']
    },
    {
        name: 'All The Things You Are',
        genre: 'Standard',
        key: 'Ab',
        style: 'Swing',
        tempo: 135,
        degrees: [],
        description: 'Jerome Kern. Circle of fifths.',
        chords: ['Fm7', 'Bbm7', 'Eb7', 'Abmaj7', 'Dbmaj7', 'G7', 'Cmaj7', 'Cmaj7',
            'Cm7', 'Fm7', 'Bb7', 'Ebmaj7', 'Abmaj7', 'D7', 'Gmaj7', 'Gmaj7']
    },
    {
        name: 'Stella By Starlight',
        genre: 'Standard',
        key: 'Bb',
        style: 'Ballad',
        tempo: 90,
        degrees: [],
        description: 'Victor Young. Non-functional beauty.',
        chords: ['Em7b5', 'A7alt', 'Cm7', 'F7', 'Fm7', 'Bb7', 'Ebmaj7', 'Ab7',
            'Bbmaj7', 'Em7b5', 'A7alt', 'Dm7b5', 'G7alt', 'Cm7b5', 'F7alt', 'Bbmaj7']
    },
    {
        name: 'Giant Steps',
        genre: 'Post-Bop',
        key: 'B',
        style: 'Swing',
        tempo: 260,
        degrees: [],
        description: 'Coltrane. Harmonic workout.',
        chords: ['Bmaj7', 'D7', 'Gmaj7', 'Bb7', 'Ebmaj7', 'Am7', 'D7',
            'Gmaj7', 'Bb7', 'Ebmaj7', 'F#7', 'Bmaj7', 'Fm7', 'Bb7', 'Ebmaj7', 'Am7/D7']
    }
];
