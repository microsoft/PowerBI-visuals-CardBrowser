/*
 * Copyright 2018 Uncharted Software Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
        expect(instanceProperties.cardWidth).to.equal(200);
    });

    it('destroy', () => {
        visual.destroy();
    });
});
