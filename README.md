# LAZ.ts 🗺️

TypeScript package for loading LAS/LAZ, primary developed for for WebGL applications, intended for lazy people who just want to load their point clouds and don't care about the details.

-   ✅ returns a dev-friendly format
-   ✅ internally based on [laz-perf](https://github.com/hobuinc/laz-perf)
-   ✅ supports funky coordinate systems
-   ✅ uses vitest 🧪 for testing

## Install from [npm](https://www.npmjs.com/package/lazts)

```
npm install lazts
```

| Branch  |                                                                                                                                                                            |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Release | [![LAZts CI Release](https://github.com/vojtatom/laz.ts/actions/workflows/ci.yaml/badge.svg?branch=release)](https://github.com/vojtatom/laz.ts/actions/workflows/ci.yaml) |
| Dev     | [![LAZts CI Dev](https://github.com/vojtatom/laz.ts/actions/workflows/ci.yaml/badge.svg?branch=dev)](https://github.com/vojtatom/laz.ts/actions/workflows/ci.yaml)         |

## Usage

```ts
import { parse } from 'lazts/lazts';

//1) obtain ArrayBuffer somehow
const arrayBuffer = openFileAsArray('testdata/test.las');
//2) parse it
const data: LazData = await parse(arrayBuffer);
```

where `LazData` is defined as

```ts
interface LazData {
    header: {
        pointsOffset: number;
        pointsFormatId: number;
        pointsStructSize: number;
        pointsCount: number;
        scale: [number, number, number];
        offset: [number, number, number];
        maxs: [number, number, number];
        mins: [number, number, number];
        totalToRead: number;
        totalRead: number;
    };
    attributes: {
        position: { value: Int32Array; size: 3 };
        intensity: { value: Float32Array; size: 1 };
        classification: { value: Uint8Array; size: 1 };
        color0?: { value: Uint8Array; size: 4 };
    };
}
```
