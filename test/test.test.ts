import { expect, test } from 'vitest';
import { parse } from '@lazts/lazts';
import { openFileAsArray } from './utils';

test('Basic test LAZ', async () => {
    const buffer = openFileAsArray('testdata/test.laz');
    const data = await parse(buffer);
    console.log(data);
});

test('Basic test LAA', async () => {
    const buffer = openFileAsArray('testdata/test.las');
    const data = await parse(buffer);
    console.log(data);
});
