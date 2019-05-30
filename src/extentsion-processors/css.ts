import * as fs from 'fs';

import Base from './base';

export default class Css extends Base {

    public process(src: string, dest: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.copyFile(src, dest, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}
