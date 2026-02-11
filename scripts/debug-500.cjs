const unscramble = require('ireal-reader/unscramble');
const url = "irealb://500%20Miles%20High%3DCorea%20Chick%3D%3DBossa%20Nova%3DE-%3D7%3D1r34LbKcu77E%7CQy-7XyQL%20lcKQyX7%5EbBZLl%20cKQyX7-GZL%20lcKZBh7XE44T%5BQyX7-%7CA-7XlcKQyX7-FZL%20lcQKyX7h%23FZL%20lcKQy%20QLZCQyX9%23KQyX7ZB7%239%20lcKQyX7-CQ%7BY%20Q%20yXQyXZ%20%20lcKQyXLZAb%5EL%20lcKcl%20%20%7D%3DJazz-Bossa%20Nova%3D140%3D0%3D%3D%3D";
const decoded = decodeURIComponent(url);
const musicRaw = decoded.split("1r34LbKcu7")[1].split("=")[0];
const unscrambled = unscramble.ireal(musicRaw);

console.log("Unscrambled Music String:");
console.log(unscrambled);

// Simple bar counter
let bars = [];
let currentBar = "";
let tokens = unscrambled.split(/([|Z\[\]{}<>*])/);
for (let t of tokens) {
    if (!t) continue;
    if (t === '|' || t === 'Z' || t === '[' || t === ']') {
        bars.push(currentBar.trim());
        currentBar = "";
    } else if (t === '{' || t === '}' || t === '<' || t === '>' || t === '*') {
        // Just note the symbol
        bars.push("SYMBOL: " + t);
    } else if (t === 'XyQKcl') {
        // Repeat previous bar
        bars.push("REPEAT PREV");
    } else if (t.startsWith('XyQ')) {
        // Space?
    } else {
        currentBar += t + " ";
    }
}

console.log("\nBar list (very approximate):");
bars.forEach((b, i) => console.log(`${i + 1}: ${b}`));
