const fs = require('fs');
const path = require('path');
const iRealReader = require('ireal-reader');
const unscramble = require('ireal-reader/unscramble');

const PLAYLIST_PATH = path.join(__dirname, '..', 'src', 'modules', 'JazzKiller', 'JazzStandards-main', 'ireal-jazz-playlist.json');
const playlistRaw = fs.readFileSync(PLAYLIST_PATH, 'utf8');

function findSongUrl(title) {
    const search = encodeURIComponent(title).replace(/\(/g, '%28').replace(/\)/g, '%29');
    const regex = new RegExp(search + "[^=]*=[^=]*=[^=]*=[^=]*=[^=]*=[^=]*=[^=]*=[^=]*", "i");
    const match = playlistRaw.match(regex);
    return match ? decodeURIComponent(match[0]) : null;
}

function extractMusicRaw(url) {
    const musicPrefix = "1r34LbKcu7";
    const parts = url.split("=");
    const musicPart = parts.find(p => p.includes(musicPrefix));
    return musicPart ? musicPart.split(musicPrefix)[1] : null;
}

function parseSections(musicRaw) {
    const unscrambled = unscramble.ireal(musicRaw);
    // console.log("Unscrambled:", unscrambled);

    const rules = [
        { token: 'XyQ', type: 'spacer' },
        { token: /\*\w/, type: 'label', op: (m, s) => s.currentLabel = m[0].substring(1) },
        { token: /<(.*?)>/, type: 'comment' },
        { token: /T(\d+)/, type: 'ts' },
        { token: 'x', type: 'repeat1' },
        { token: 'Kcl', type: 'repeat1new' },
        { token: 'r|XyQ', type: 'repeat2' },
        { token: /Y+/, type: 'spacer' },
        { token: 'n', type: 'nc' },
        { token: 'S', type: 'segno' },
        { token: 'Q', type: 'coda' },
        { token: '{', type: 'startRepeat', op: (m, s) => s.currentSection.Repeats = 1 },
        { token: '}', type: 'endRepeat', op: (m, s) => s.finishSection() },
        { token: /[|Z\[\]]/, type: 'bar', op: (m, s) => s.newBar() },
        { token: /N(\d)/, type: 'ending', op: (m, s) => s.startEnding(m[1]) },
        { token: /[A-GW]{1}[\+\-\^\dhob#suadlt]*(\/[A-G][#b]?)?/, type: 'chord', op: (m, s) => s.addChord(m[0]) }
    ];

    let state = {
        sections: [],
        currentSection: { MainSegment: { Chords: [] } },
        currentLabel: null,
        bars: [],
        currentBar: [],

        newBar: function () {
            if (this.currentBar.length > 0) {
                this.bars.push(this.currentBar.join(','));
                this.currentBar = [];
            }
        },
        addChord: function (c) {
            this.currentBar.push(c);
        },
        finishSection: function () {
            this.newBar();
            if (this.bars.length > 0) {
                this.currentSection.MainSegment.Chords = this.bars.join('|');
                if (this.currentLabel) this.currentSection.Label = this.currentLabel;
                this.sections.push(this.currentSection);
                this.bars = [];
                this.currentSection = { MainSegment: { Chords: [] } };
                this.currentLabel = null;
            }
        },
        startEnding: function (n) {
            // Endings are tricky. In our format we have section.Endings array.
            // Simplified: if we hit an ending, we probably should have finished the MainSegment.
            if (!this.currentSection.Endings) this.currentSection.Endings = [];
            this.newBar();
            // This is incomplete logic for endings but let's see for 500 Miles High.
        }
    };

    function parse(input) {
        if (!input) return;
        for (let rule of rules) {
            if (typeof rule.token === 'string' && input.startsWith(rule.token)) {
                if (rule.op) rule.op(rule.token, state);
                return parse(input.substring(rule.token.length).trim());
            } else if (rule.token instanceof RegExp) {
                const match = input.match(rule.token);
                if (match && match.index === 0) {
                    if (rule.op) rule.op(match, state);
                    return parse(input.substring(match[0].length).trim());
                }
            }
        }
        return parse(input.substring(1));
    }

    parse(unscrambled);
    state.finishSection();
    return state.sections.filter(s => s.MainSegment.Chords);
}

const url = "irealb://500%20Miles%20High%3DCorea%20Chick%3D%3DBossa%20Nova%3DE-%3D7%3D1r34LbKcu77E%7CQy-7XyQL%20lcKQyX7%5EbBZLl%20cKQyX7-GZL%20lcKZBh7XE44T%5BQyX7-%7CA-7XlcKQyX7-FZL%20lcQKyX7h%23FZL%20lcKQy%20QLZCQyX9%23KQyX7ZB7%239%20lcKQyX7-CQ%7BY%20Q%20yXQyXZ%20%20lcKQyXLZAb%5EL%20lcKcl%20%20%7D%3DJazz-Bossa%20Nova%3D140%3D0%3D%3D%3D";
const musicRaw = extractMusicRaw(url);
const sections = parseSections(musicRaw);
console.log(JSON.stringify(sections, null, 2));
