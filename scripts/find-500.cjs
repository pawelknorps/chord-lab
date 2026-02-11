const fs = require('fs');
const content = fs.readFileSync('/Users/pawelknorps/chord-lab/src/modules/JazzKiller/JazzStandards-main/ireal-jazz-playlist.json', 'utf8');
const matches = content.match(/irealb:\/\/500%20Miles%20High[^ "]*|=500%20Miles%20High[^ "]*|500%20Miles%20High[^ "]*/g);
if (matches) {
    matches.forEach(m => console.log(decodeURIComponent(m)));
} else {
    console.log("No matches found");
}
