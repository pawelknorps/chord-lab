const iRealReader = require('ireal-reader');
// Real 500 Miles High string from the file
const url = "irealb://500%20Miles%20High%3DCorea%20Chick%3D%3DBossa%20Nova%3DE-%3D7%3D1r34LbKcu77E%7CQy-7XyQL%20lcKQyX7%5EbBZLl%20cKQyX7-GZL%20lcKZBh7XE44T%5BQyX7-%7CA-7XlcKQyX7-FZL%20lcQKyX7h%23FZL%20lcKQy%20QLZCQyX9%23KQyX7ZB7%239%20lcKQyX7-CQ%7BY%20Q%20yXQyXZ%20%20lcKQyXLZAb%5EL%20lcKcl%20%20%7D%3DJazz-Bossa%20Nova%3D140%3D0%3D%3D%3D";
const playlist = iRealReader(decodeURIComponent(url));
console.log(JSON.stringify(playlist.songs[0], null, 2));
