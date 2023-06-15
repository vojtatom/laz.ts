import { LASDecoder } from './decoder';
import { LASLoader } from './loaderLAS';
import { LAZLoader } from './loaderLAZ';
import { LASHeader, LASRawData } from './types';
import { POINT_FORMAT_READERS, readAs } from './utils';

/**
 * A single consistent interface for loading LAS/LAZ files
 */
export class LASFile {
    arraybuffer: ArrayBuffer;
    formatId = 0;
    loader: LASLoader | LAZLoader;
    isCompressed = true;
    isOpen = false;
    version = 0;
    versionAsString = '';

    constructor(arraybuffer: ArrayBuffer) {
        this.arraybuffer = arraybuffer;

        if (this.determineVersion() > 14) {
            throw new Error('Only file versions <= 1.4 are supported at this time');
        }

        this.determineFormat();
        if (POINT_FORMAT_READERS[this.formatId] === undefined) {
            throw new Error('The point format ID is not supported');
        }

        this.loader = this.isCompressed
            ? new LAZLoader(this.arraybuffer)
            : new LASLoader(this.arraybuffer);
    }

    /**
     * Determines format in parameters of LASHeaer
     */
    determineFormat(): void {
        const formatId = readAs(this.arraybuffer, Uint8Array, 32 * 3 + 8);
        const bit7 = (formatId & 0x80) >> 7;
        const bit6 = (formatId & 0x40) >> 6;

        if (bit7 === 1 && bit6 === 1) {
            throw new Error('Old style compression not supported');
        }

        this.formatId = formatId & 0x3f;
        this.isCompressed = bit7 === 1 || bit6 === 1;
    }

    /**
     * Determines version
     * @returns version
     */
    determineVersion(): number {
        const ver = new Int8Array(this.arraybuffer, 24, 2);
        this.version = ver[0] * 10 + ver[1];
        this.versionAsString = `${ver[0]}.${ver[1]}`;
        return this.version;
    }

    /**
     * Reads if the file is open
     * @returns boolean
     */
    async open() {
        if (await this.loader.open()) {
            this.isOpen = true;
        }
    }
    /**
     * Gets the header
     * @returns Header
     */
    getHeader(): LASHeader {
        return this.loader.getHeader();
    }

    /**
     * @param count
     * @param start
     * @param skip
     * @returns Data
     */
    readData(count: number, start: number, skip: number): LASRawData {
        return this.loader.readData(count, start, skip);
    }

    /**
     * Closes the file
     */
    close(): void {
        if (this.loader.close()) {
            this.isOpen = false;
        }
    }
    /**
     */
    getUnpacker(): typeof LASDecoder {
        return LASDecoder;
    }
}
