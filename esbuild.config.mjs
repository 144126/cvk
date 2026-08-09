import esbuild from 'esbuild';

const prod = process.argv[2] === 'production';

const context = await esbuild.context({
	bundle: true,
	entryPoints: ['main.ts'],
	outfile: 'main.js',
	format: 'cjs',
	platform: 'browser',
	external: ['obsidian'],
	target: 'es2021',
	sourcemap: prod ? false : 'inline',
	treeShaking: true,
	minify: prod,
});

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
