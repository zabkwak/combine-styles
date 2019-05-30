import * as sass from 'node-sass';
import * as fs from 'fs';
import * as path from 'path';

import Base from './base';

export default class Sass extends Base {

    public process(src: string, dest: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.readFile(src, (err, buffer) => {
                if (err) {
                    reject(err);
                    return;
                }
                // TODO relative path to the node_modules
                const data = buffer.toString().replace(/@import(.*)~/g, '@import$1./node_modules/');
                sass.render({
                    data,
                    //file: src,
                    //includePaths: ['./node_modules'],
                }, (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    fs.writeFile(dest, result.css, (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve();
                    });
                });
            });
        });
    }
}