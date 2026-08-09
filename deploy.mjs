import fs from 'fs';
import os from 'os';
import path from 'path';

const HOME = os.homedir();
const cfg_paths = [path.join(HOME, '.config/obsidian/obsidian.json'), path.join(HOME, '.obsidian/obsidian.json')];

const cfg_file = cfg_paths.find((p) => fs.existsSync(p));
if (!cfg_file) {
	console.error('No Obsidian config found at', cfg_paths);
	process.exit(1);
}

const cfg = JSON.parse(fs.readFileSync(cfg_file, 'utf8'));
const vaults = Object.values(cfg.vaults || {}).map((v) => v.path);
const files = ['main.js', 'manifest.json'];

let count = 0;
for (const v of vaults) {
	const dir = path.join(v, '.obsidian', 'plugins', 'cvk');
	fs.mkdirSync(dir, { recursive: true });
	for (const f of files) fs.copyFileSync(path.join(process.cwd(), f), path.join(dir, f));
	fs.writeFileSync(path.join(dir, '.hotreload'), '');
	console.log('deployed cvk to', v);
	count++;
}

console.log(`done. ${count} vault(s) updated.`);
