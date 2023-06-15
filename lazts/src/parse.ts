import { LASData, LASHeader } from './types';
import { logStatistics } from './log';
import { parseLASChunked } from './parseChunk';

export async function parse(arrayBuffer: ArrayBuffer): Promise<LASData> {
    const lasData: LASData = {
        header: {} as LASHeader,
        attributes: {},
    };

    await parseLASChunked(arrayBuffer, lasData, 1);
    logStatistics(lasData, arrayBuffer.byteLength);
    return lasData;
}
