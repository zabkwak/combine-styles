import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';

import Processor from '../src';

describe('Processor', () => {

    // TODO instance validator

    it('.process', async () => {
        const p = new Processor([
            path.resolve(__dirname, './styles-in'),
            path.resolve(__dirname, './test-src.css'),
        ], path.resolve(__dirname, './styles/app.css'));
        await p.process();

        expect(fs.existsSync(path.resolve(__dirname, './styles'))).to.be.true;
        // expect(fs.existsSync(path.resolve(__dirname, './styles/cs-tmp'))).to.be.true;
        const content = fs.readFileSync(path.resolve(__dirname, './styles/app.css')).toString();
        expect(content).to.be.equal('#some-test{background-color:yellow}body{background-color:red}#test{background-color:yellow}#content{width:1300px;margin:0 auto}');
    });
});