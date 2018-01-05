/**
 * Copyright (c) 2017 Uncharted Software Inc.
 * http://www.uncharted.software/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the 'Software'), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import * as $ from 'jquery';
import * as sinon from 'sinon';
import { expect } from 'chai';
import CardBrowser from './VisualMain';
import VisualConstructorOptions = powerbi.extensibility.v110.VisualConstructorOptions;
import populateData from './test_data/testDataUtils';
import colors from './test_data/colors';

describe('Card Browser Visual', () => {
    let visual;

    before(function () {
        const element = $('<div></div>');
        const dummyHost = {
            createSelectionManager: () => ({ hostServices: 'hostService' } as any),
            colors: colors,
        };
        visual = new CardBrowser(<VisualConstructorOptions>{
            element: element[0],
            host: dummyHost,
        });
    });

    it('exists', () => {
        expect(CardBrowser).to.be.ok;
        expect(visual).to.be.ok;
    });

    it('update', () => {
        const options = populateData([]);
        visual.update(options);
    });

    it('enumerateObjectInstances', () => {
        const options = {
            objectName: 'presentation',
        };
        const instances = visual.enumerateObjectInstances(options);
        expect(instances).to.be.ok;
        expect(instances.length).to.equal(1);
        const instanceProperties = instances[0].properties;
        expect(instanceProperties.shadow).to.be.true;
        expect(instanceProperties.dateFormat).to.equal('MMM D, YYYY');
        expect(instanceProperties.separator).to.equal(' \u2022 ');
        expect(instanceProperties.separator).to.equal(' \u2022 ');
        expect(instanceProperties.thumbnailWidth).to.equal(200);
    });

    it('destroy', () => {
        visual.destroy();
    });
});
