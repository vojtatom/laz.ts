import { LASData, LASHeader } from './types';
import { logStatistics } from './log';
import { parseLASChunked } from './parseChunk';
import { adjust } from './adjust';

interface ParseOptions {
    adjustOffset?: boolean;
    skip?: number;
}

export async function parse(arrayBuffer: ArrayBuffer, options?: ParseOptions): Promise<LASData> {
    const lasData: LASData = {
        header: {} as LASHeader,
        attributes: {},
    };

    const { adjustOffset = false, skip = 1 } = options || {};

    await parseLASChunked(arrayBuffer, lasData, skip);

    if (adjustOffset) adjust(lasData);
    logStatistics(lasData, arrayBuffer.byteLength);
    return lasData;
}
