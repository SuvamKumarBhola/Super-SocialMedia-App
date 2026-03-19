const fs = require('fs');
let c = fs.readFileSync('src/pages/Landing.jsx', 'utf8');
c = c.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('src/pages/Landing.jsx', c);
