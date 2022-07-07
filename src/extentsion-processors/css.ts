import { promises as fs } from 'fs';

import Base from './base';

export default class Css extends Base {

	public async process(src: string, dest: string): Promise<void> {
		await fs.copyFile(src, dest);
	}
}
