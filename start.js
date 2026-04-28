const { spawn } = require('child_process');

console.log('');
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║                                                           ║');
console.log('║     🚀 Starting Acadomix...                               ║');
console.log('║                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');

const server = spawn('node', ['server/server.js'], {
    stdio: 'inherit',
    shell: true
});

server.on('error', (err) => {
    console.error('❌ Failed to start server:', err);
});

server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
});

process.on('SIGINT', () => {
    console.log('\n👋 Shutting down Acadomix...');
    server.kill();
    process.exit();
});