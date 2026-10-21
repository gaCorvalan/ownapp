import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const preload = path.join(root, 'scripts', 'web-isolation.cjs');
const extra = process.argv.slice(2);
const args = ['exec', 'expo', 'start', '--web'];

if (!extra.some((arg) => arg === '--host' || arg === '-m')) args.push('--host', 'lan');
if (!extra.some((arg) => arg === '--port' || arg === '-p')) args.push('--port', '8081');
args.push(...extra);

const env = {
  ...process.env,
  EXPO_NO_TELEMETRY: '1',
  NODE_OPTIONS: [process.env.NODE_OPTIONS, `--require ${preload}`].filter(Boolean).join(' '),
};
if (!process.stdout.isTTY && !env.BROWSER) env.BROWSER = 'none';

const child = spawn('pnpm', args, {
  cwd: root,
  stdio: 'inherit',
  env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
