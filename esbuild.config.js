import { build } from 'esbuild';

await build({
  entryPoints: ['server/index.ts'],
  platform: 'node',
  bundle: true,
  format: 'esm',
  outdir: 'dist',
  external: [
    '@babel/preset-typescript',
    'lightningcss',
    '../pkg',
    '../lightningcss.*.node',
    'dotenv',
    'fs',
    'path',
    'child_process'
  ],
  packages: 'external'
});
