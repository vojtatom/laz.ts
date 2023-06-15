export type TypedArray =
    | Int8Array
    | Uint8Array
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Uint8ClampedArray
    | Float32Array
    | Float64Array;

export type Attribute = {
    value: TypedArray;
    size: number;
    byteOffset?: number;
    byteStride?: number;
    normalized?: boolean;
};

export type LASHeader = {
    pointsOffset: number;
    pointsFormatId: number;
    pointsStructSize: number;
    pointsCount: number;
    scale: [number, number, number];
    offset: [number, number, number];
    maxs?: number[];
    mins?: number[];
    totalToRead: number;
    totalRead: number;
    versionAsString?: string;
    isCompressed?: boolean;
    bbox?: number[][];
};

export type LASData = {
    header: LASHeader;
    attributes: { [attributeName: string]: Attribute };
};

export const IntensityType = Float32Array; //Uint16Array
export type IntensityType = Float32Array; //Uint16Array

export type LASChunk = {
    count: number;
    buffer: ArrayBuffer;
    hasMoreData: boolean;
    versionAsString?: string;
    isCompressed?: boolean;
};

export type LASReader = (dv: DataView) => {
    [LASAttribute: string]: number | number[];
};

export type LASReaders = {
    [key: number]: LASReader;
};

export type LASRawData = {
    buffer: ArrayBuffer;
    count: number;
    hasMoreData: boolean;
};
