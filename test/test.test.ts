import { expect, test } from 'vitest';
import { parse } from '@lazts/lazts';
import { openFileAsArray } from './utils';

test('Basic test LAZ', async () => {
    const buffer = openFileAsArray('testdata/test.laz');
    const data = await parse(buffer);
    console.log(data);
});

test('Basic test LAS', async () => {
    const buffer = openFileAsArray('testdata/test.las');
    const data = await parse(buffer);
    console.log(data);
});

test('Basic test no offset LAZ', async () => {
    const buffer = openFileAsArray('testdata/testNoOffset.laz');
    const data = await parse(buffer);
    console.log(data);
    data.header.offset.forEach((v) => expect(v).toBeCloseTo(0));

    const dataAdjusted = await parse(buffer, {
        adjustOffset: true,
    });

    console.log(dataAdjusted);
    dataAdjusted.header.offset.forEach((v) => expect(v).not.toBeCloseTo(0));
});
