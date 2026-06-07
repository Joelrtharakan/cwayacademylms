const { spawn } = require('child_process');
const api = spawn('npx', ['ts-node', 'src/server.ts'], { cwd: '/Users/joeltharakan/Documents/cway-academy/apps/api' });

api.stdout.on('data', data => {
  console.log(data.toString());
  if (data.toString().includes('running on port')) {
    const test = spawn('node', ['../../test-create.js'], { cwd: '/Users/joeltharakan/Documents/cway-academy/apps/api' });
    test.stdout.on('data', d => console.log('TEST:', d.toString()));
    test.stderr.on('data', d => console.log('TEST ERR:', d.toString()));
    test.on('close', () => api.kill('SIGKILL'));
  }
});
