import { useState } from 'react';
// @ts-ignore
import iRealReader from 'ireal-reader';

export interface IRealSong {
    title: string;
    composer: string;
    style: string;
    key: string;
    music: {
        measures: IRealMeasure[];
    };
}

export interface IRealMeasure {
    chords: string[]; // Simplification, actual structure might vary
    bars?: string;
}

export const useIRealParser = () => {
    const [song, setSong] = useState<any>(null); // keeping any for flexibility until structure is confirmed
    const [parseError, setParseError] = useState<string | null>(null);

    const parseSong = (url: string) => {
        try {
            console.log("Parsing URL:", url);
            // The library might export a class or function.
            // Based on user prompt: new iRealReader(url)

            // Check if it's a full url or just the content
            const playlist = new iRealReader(url);

            console.log("Parsed Playlist:", playlist);

            if (playlist.songs && playlist.songs.length > 0) {
                setSong(playlist.songs[0]);
                setParseError(null);
            } else {
                setParseError("No songs found.");
            }
        } catch (e: any) {
            console.error("iReal Parse Error:", e);
            setParseError(e.message || "Failed to parse");
        }
    };

    return { song, parseError, parseSong };
};
