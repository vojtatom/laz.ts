import { LASHeader, LASReaders } from './types';

export const POINT_FORMAT_READERS: LASReaders = {
    0: (dv) => {
        return {
            position: [dv.getInt32(0, true), dv.getInt32(4, true), dv.getInt32(8, true)],
            intensity: dv.getUint16(12, true),
            classification: dv.getUint8(15),
        };
    },
    1: (dv) => {
        return {
            position: [dv.getInt32(0, true), dv.getInt32(4, true), dv.getInt32(8, true)],
            intensity: dv.getUint16(12, true),
            classification: dv.getUint8(15),
        };
    },
    2: (dv) => {
        return {
            position: [dv.getInt32(0, true), dv.getInt32(4, true), dv.getInt32(8, true)],
            intensity: dv.getUint16(12, true),
            classification: dv.getUint8(15),
            color: [dv.getUint16(20, true), dv.getUint16(22, true), dv.getUint16(24, true)],
        };
    },
    3: (dv) => {
        return {
            position: [dv.getInt32(0, true), dv.getInt32(4, true), dv.getInt32(8, true)],
            intensity: dv.getUint16(12, true),
            classification: dv.getUint8(15),
            color: [dv.getUint16(28, true), dv.getUint16(30, true), dv.getUint16(32, true)],
        };
    },
};

/**
 * Reads incoming binary data depends on the Type parameter
 * @param buf
 * @param Type
 * @param offset
 * @param count
 * @returns number | number[] from incoming binary data
 */
export function readAs(buf: ArrayBuffer, Type: any = {}, offset: number, count?: number) {
    count = count === undefined || count === 0 ? 1 : count;
    const sub = buf.slice(offset, offset + Type.BYTES_PER_ELEMENT * count);

    const r = new Type(sub);
    if (count === 1) {
        return r[0];
    }

    const ret: number[] = [];
    for (let i = 0; i < count; i++) {
        ret.push(r[i]);
    }

    return ret;
}

/**
 * Parsing of header's attributes
 * @param arraybuffer
 * @returns header as LASHeader
 */
export function parseLASHeader(arraybuffer: ArrayBuffer): LASHeader {
    let start = 32 * 3 + 35;

    const o: Partial<LASHeader> = {
        pointsOffset: readAs(arraybuffer, Uint32Array, 32 * 3),
        pointsFormatId: readAs(arraybuffer, Uint8Array, 32 * 3 + 8),
        pointsStructSize: readAs(arraybuffer, Uint16Array, 32 * 3 + 8 + 1),
        pointsCount: readAs(arraybuffer, Uint32Array, 32 * 3 + 11),
        scale: readAs(arraybuffer, Float64Array, start, 3),
    };
    start += 24; // 8*3
    o.offset = readAs(arraybuffer, Float64Array, start, 3);
    start += 24;

    const bounds = readAs(arraybuffer, Float64Array, start, 6);
    start += 48; // 8*6;
    o.maxs = [bounds[0], bounds[2], bounds[4]];
    o.mins = [bounds[1], bounds[3], bounds[5]];

    return o as LASHeader;
}
