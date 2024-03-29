import { promises as fs } from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as uniqid from 'uniqid';
import * as uglifyCSS from 'uglifycss';

import BaseExtensionProcessor from './extentsion-processors/base';
import CSSProcessor from './extentsion-processors/css';
import SassProcessor from './extentsion-processors/sass';

const EXT_NAMES = ['.css', '.scss'];

export default class Processor {

	private _sources: Array<string>;
	private _out: string;
	private _outDir: string;
	private _tmpDir: string;
	private _processors: { [ext: string]: BaseExtensionProcessor } = {};

	constructor(sources: Array<string>, out: string) {
		this._sources = sources;
		this._out = out;
		this._outDir = path.dirname(this._out);
		this._tmpDir = `${this._outDir}/cs-tmp-${uniqid()}`;
		this
			.registerExtensionProcessor('css', new CSSProcessor())
			.registerExtensionProcessor('scss', new SassProcessor());
	}

	public registerExtensionProcessor(ext: string, processor: BaseExtensionProcessor): this {
		this._processors[ext] = processor;
		return this;
	}

	public async process(): Promise<void> {
		await this._createDir();
		// TODO clear the out file before processing
		const files: Array<string> = [];
		for (let i = 0; i < this._sources.length; i++) {
			const source = this._sources[i];
			const stat = await fs.stat(source);
			if (!stat.isDirectory()) {
				files.push(source);
				continue;
			}
			files.push(...await this._scanDir(source, Object.keys(this._processors)));
		}
		await this._processFiles(files);
		await this._merge();
		await this._cleanup();
	}

	private async _scanDir(dir: string, extNames: Array<string>): Promise<Array<string>> {
		extNames = extNames.map(ext => ext.indexOf('.') === 0 ? ext : `.${ext}`);
		const out: Array<string> = [];
		const files = await fs.readdir(dir);
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const p = `${dir}/${file}`;
			const stat = await fs.stat(p);
			if (stat.isDirectory()) {
				out.push(...await this._scanDir(p, extNames));
				continue;
			}
			if (extNames.includes(path.extname(p))) {
				out.push(p);
			}
		}
		return out;
	}

	private async _processFiles(files: Array<string>): Promise<void> {
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const ext = path.extname(file);
			const dest = `${this._tmpDir}/rs-tmp_${uniqid()}.css`;
			const processor = this._processors[ext.substr(1)];
			if (!processor) {
				throw new Error(`File extension ${ext} not supported.`);
			}
			await processor.process(file, dest);
		}
	}

	private async _merge(): Promise<void> {
		const files = await fs.readdir(this._tmpDir);
		const result = uglifyCSS.processFiles(files.map(file => `${this._tmpDir}/${file}`));
		await fs.writeFile(this._out, result);
	}

	private async _cleanup(): Promise<void> {
		for (const file of await fs.readdir(this._tmpDir)) {
			await fs.unlink(`${this._tmpDir}/${file}`);
		}
		await fs.rmdir(this._tmpDir);
	}

	/**
	 * Creates the out dir with temp dir using mkdirp.
	 */
	private async _createDir(): Promise<void> {
		await mkdirp(this._tmpDir);
	}
}
