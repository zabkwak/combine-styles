import * as fs from 'fs';
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
        this._tmpDir = `${this._outDir}/cs-tmp`;
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
        await Promise.all(this._sources.map(async (source) => {
            const stat = fs.statSync(source);
            if (!stat.isDirectory()) {
                files.push(source);
                return;
            }
            files.push(...await this._scanDir(source, Object.keys(this._processors)));
        }));
        await this._processFiles(files);
        await this._merge();
        await this._cleanup();
    }

    private async _scanDir(dir: string, extNames: Array<string>): Promise<Array<string>> {
        extNames = extNames.map(ext => ext.indexOf('.') === 0 ? ext : `.${ext}`);
        const out: Array<string> = [];
        const files = fs.readdirSync(dir);
        await Promise.all(files.map(async (file) => {
            const p = `${dir}/${file}`;
            const stat = fs.statSync(p);
            if (stat.isDirectory()) {
                out.push(...await this._scanDir(p, extNames));
                return;
            }
            if (extNames.includes(path.extname(p))) {
                out.push(p);
            }
        }));
        return out;
    }

    private async _processFiles(files: Array<string>): Promise<void> {
        await Promise.all(files.map(async (file) => {
            const ext = path.extname(file);
            const dest = `${this._tmpDir}/rs-tmp_${uniqid()}.css`;
            const processor = this._processors[ext.substr(1)];
            if (!processor) {
                throw new Error(`File extension ${ext} not supported.`);
            }
            await processor.process(file, dest);
        }));
    }

    private async _merge(): Promise<void> {
        const result = uglifyCSS.processFiles(fs.readdirSync(this._tmpDir).map(file => `${this._tmpDir}/${file}`));
        fs.writeFileSync(this._out, result);
    }

    private async _cleanup(): Promise<void> {
        fs.readdirSync(this._tmpDir).forEach(file => fs.unlinkSync(`${this._tmpDir}/${file}`));
        fs.rmdirSync(this._tmpDir);
    }

    /**
     * Creates the out dir with temp dir using mkdirp.
     */
    private _createDir(): Promise<void> {
        return new Promise((resolve, reject) => {
            mkdirp(this._tmpDir, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}
