import { LASHeader } from './types';
import { POINT_FORMAT_READERS } from './utils';

/**
 * Helper class: Decodes LAS records into points
 */
export class LASDecoder {
    arrayb: ArrayBuffer;
    decoder: (dv: DataView) => unknown;
    pointsCount: number;
    pointSize: number;
    scale: [number, number, number];
    offset?: [number, number, number];
    mins?: number[];
    maxs?: number[];

    constructor(buffer: ArrayBuffer, len: number, header: LASHeader) {
        this.arrayb = buffer;
        this.decoder = POINT_FORMAT_READERS[header.pointsFormatId];
        this.pointsCount = len;
        this.pointSize = header.pointsStructSize;
        this.scale = header.scale;
        this.offset = header.offset;
        this.mins = header.mins;
        this.maxs = header.maxs;
    }

    /**
     * Decodes data depends on this point size
     * @param index
     * @returns New object
     */
    getPoint(index: number): unknown {
        if (index < 0 || index >= this.pointsCount) {
            throw new Error('Point index out of range');
        }

        const dv = new DataView(this.arrayb, index * this.pointSize, this.pointSize);
        return this.decoder(dv);
    }
}
