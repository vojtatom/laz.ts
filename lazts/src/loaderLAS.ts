// LAS Loader
// Loads uncompressed files

import { LASHeader } from './types';
import { parseLASHeader } from './utils';

//
export class LASLoader {
    arraybuffer: ArrayBuffer;
    readOffset = 0;
    header: LASHeader = {
        pointsOffset: 0,
        pointsFormatId: 0,
        pointsStructSize: 0,
        pointsCount: 0,
        scale: [0, 0, 0],
        offset: [0, 0, 0],
        maxs: [0],
        mins: [0],
        totalToRead: 0,
        totalRead: 0,
        versionAsString: '',
        isCompressed: true,
    };

    constructor(arraybuffer: ArrayBuffer) {
        this.arraybuffer = arraybuffer;
    }

    /**
     * @returns boolean
     */
    async open() {
        // Nothing needs to be done to open this
        return true;
    }
    /**
     * Parsing of incoming binary
     * @returns LASHeader
     */
    getHeader() {
        this.header = parseLASHeader(this.arraybuffer);
        return this.header;
    }

    /**
     * Reading data
     * @param count
     * @param skip
     * @returns new ArrayBuffer, count, hasMoreData
     */
    readData(count: number, skip: number) {
        const { header, arraybuffer } = this;
        if (!header) {
            throw new Error('Cannot start reading data till a header request is issued');
        }

        let { readOffset } = this;
        let start: number;

        if (skip <= 1) {
            count = Math.min(count, header.pointsCount - readOffset);
            start = header.pointsOffset + readOffset * header.pointsStructSize;
            const end = start + count * header.pointsStructSize;
            readOffset += count;
            this.readOffset = readOffset;
            return {
                buffer: arraybuffer.slice(start, end),
                count,
                hasMoreData: readOffset < header.pointsCount,
            };
        }

        const pointsToRead = Math.min(count * skip, header.pointsCount - readOffset);
        const bufferSize = Math.ceil(pointsToRead / skip);
        let pointsRead = 0;

        const buf = new Uint8Array(bufferSize * header.pointsStructSize);
        for (let i = 0; i < pointsToRead; i++) {
            if (i % skip === 0) {
                start = header.pointsOffset + readOffset * header.pointsStructSize;
                const src = new Uint8Array(arraybuffer, start, header.pointsStructSize);

                buf.set(src, pointsRead * header.pointsStructSize);
                pointsRead++;
            }

            readOffset++;
        }
        this.readOffset = readOffset;

        return {
            buffer: buf.buffer,
            count: pointsRead,
            hasMoreData: readOffset < header.pointsCount,
        };
    }
    /**
     * Method which brings data to null to close the file
     * @returns
     */
    close() {
        this.arraybuffer = null as any;
        return true;
    }
}
