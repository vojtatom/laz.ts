import { LASHeader, LASRawData } from './types';
import { parseLASHeader } from './utils';
import { createLazPerf } from 'laz-perf';

let Module: any = null;

export class LAZLoader {
    arraybuffer: ArrayBuffer;
    instance: any = null; // LASZip instance
    header: LASHeader | null = null;

    constructor(arraybuffer: ArrayBuffer) {
        this.arraybuffer = arraybuffer;
    }

    /**
     * Opens the file
     * @returns boolean
     */
    async open(): Promise<boolean> {
        if (!Module) {
            Module = await createLazPerf();
        }

        try {
            const { arraybuffer } = this;
            this.instance = new Module.LASZip();
            const abInt = new Uint8Array(arraybuffer);
            const buf = Module._malloc(arraybuffer.byteLength);

            this.instance.arraybuffer = arraybuffer;
            this.instance.buf = buf;
            Module.HEAPU8.set(abInt, buf);
            this.instance.open(buf, arraybuffer.byteLength);

            this.instance.readOffset = 0;

            return true;
        } catch (error) {
            throw new Error(`Failed to open file: ${(error as Error).message}`);
        }
    }

    getHeader(): LASHeader {
        //if (!this.instance) {
        //    throw new Error('You need to open the file before trying to read header');
        //}

        try {
            const header = parseLASHeader(this.arraybuffer);
            header.pointsFormatId &= 0x3f;
            this.header = header;
            return header;
        } catch (error) {
            throw new Error(`Failed to get header: ${(error as Error).message}`);
        }
    }
    /**
     * @param count
     * @param offset
     * @param skip
     * @returns Data
     */
    readData(count: number, offset: number, skip: number): LASRawData {
        if (!this.instance) {
            throw new Error('You need to open the file before trying to read stuff');
        }

        const { header, instance } = this;

        if (!header) {
            throw new Error(
                'You need to query header before reading, I maintain state that way, sorry :('
            );
        }

        try {
            const pointsToRead = Math.min(count * skip, header.pointsCount - instance.readOffset);
            const bufferSize = Math.ceil(pointsToRead / skip);
            let pointsRead = 0;

            const thisBuf = new Uint8Array(bufferSize * header.pointsStructSize);
            const bufRead = Module._malloc(header.pointsStructSize);
            for (let i = 0; i < pointsToRead; i++) {
                instance.getPoint(bufRead);

                if (i % skip === 0) {
                    const a = new Uint8Array(
                        Module.HEAPU8.buffer,
                        bufRead,
                        header.pointsStructSize
                    );
                    thisBuf.set(a, pointsRead * header.pointsStructSize);
                    pointsRead++;
                }

                instance.readOffset++;
            }

            return {
                buffer: thisBuf.buffer,
                count: pointsRead,
                hasMoreData: instance.readOffset < header.pointsCount,
            };
        } catch (error) {
            throw new Error(`Failed to read data: ${(error as Error).message}`);
        }
    }

    /**
     * Deletes the instance
     * @returns boolean
     */
    close(): boolean {
        try {
            if (this.instance !== null) {
                this.instance.delete();
                this.instance = null;
            }
            return true;
        } catch (error) {
            throw new Error(`Failed to close file: ${(error as Error).message}`);
        }
    }
}
