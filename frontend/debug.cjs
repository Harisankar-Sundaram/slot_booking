const fs = require('fs');
try {
    const pkg = require('tailwindcss/package.json');
    console.log('Version:', pkg.version);
    console.log('Path:', require.resolve('tailwindcss'));
} catch (e) {
    console.error(e);
}
