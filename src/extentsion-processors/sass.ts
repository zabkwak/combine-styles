import * as sass from 'node-sass';
import { promises as fs } from 'fs';
import * as path from 'path';

import Base from './base';

export default class Sass extends Base {

	public async process(src: string, dest: string): Promise<void> {
		const buffer = await fs.readFile(src);
		// TODO relative path to the node_modules
		const result = await this._process(
			buffer.toString().replace(/@import(.*)~/g, '@import$1./node_modules/'),
			path.dirname(src),
		);
		await fs.writeFile(dest, result.css);
	}

	private _process(data: string, dir: string): Promise<sass.Result> {
		return new Promise((resolve, reject) => {
			sass.render({
				data,
				//file: src,
				includePaths: [dir],
				importer(url, prev, done) {
					url = url.replace(/~/, './node_modules/');
					done({ file: url });
				},
			}, (err, result) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(result);
			});
		});
	}
}