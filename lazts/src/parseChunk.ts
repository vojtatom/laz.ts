import { LASFile } from './file';
import { IntensityType, LASData, LASHeader, LASRawData } from './types';

export async function parseLASChunked(rawData: ArrayBuffer, lasData: LASData, skip: number) {
    const dataHandler = new LASFile(rawData);
    const onParseData = parseChunkCallback(lasData);

    try {
        // open data
        const header = dataHandler.getHeader();
        await dataHandler.open();
        const Unpacker = dataHandler.getUnpacker();

        const totalToRead = Math.ceil(header.pointsCount / Math.max(1, skip));
        header.totalToRead = totalToRead;
        let totalRead = 0;

        /* eslint-disable no-constant-condition */
        while (true) {
            const chunk: LASRawData = dataHandler.readData(1000 * 100, 0, skip);

            totalRead += chunk.count;
            header.totalRead = totalRead;
            const unpacker = new Unpacker(chunk.buffer, chunk.count, header);

            // surface unpacker and progress via call back
            // use unpacker.pointsCount and unpacker.getPoint(i) to handle data in app
            onParseData(unpacker, header);

            if (!chunk.hasMoreData || totalRead >= totalToRead) {
                break;
            }
        }
    } catch (e) {
        console.error(e);
        throw e;
    } finally {
        dataHandler.close();
    }
}

function parseChunkCallback(lasData: LASData) {
    let pointIndex = 0;
    let positions: Int32Array;
    let colors: Uint8Array | null;
    let intensities: IntensityType;
    let classifications: Uint8Array;
    let originalHeader: any;

    return (decoder: any = {}, lasHeader: LASHeader) => {
        if (!originalHeader) {
            originalHeader = lasHeader;
            const total = lasHeader.totalToRead;

            positions = new Int32Array(total * 3);
            // laslaz-decoder.js `pointFormatReaders`
            colors = lasHeader.pointsFormatId >= 2 ? new Uint8Array(total * 4) : null;
            intensities = new IntensityType(total);
            classifications = new Uint8Array(total);

            lasData.header = lasHeader;
            lasData.attributes = {
                position: { value: positions, size: 3 },
                intensity: { value: intensities, size: 1 },
                classification: { value: classifications, size: 1 },
            };

            if (colors) {
                lasData.attributes.color0 = { value: colors, size: 4 };
            }
        }

        const batchSize = decoder.pointsCount;
        //const twoByteColor = detectTwoByteColors(decoder, batchSize);

        for (let i = 0; i < batchSize; i++) {
            const { position, color, intensity, classification } = decoder.getPoint(i);

            positions[pointIndex * 3] = position[0];
            positions[pointIndex * 3 + 1] = position[1];
            positions[pointIndex * 3 + 2] = position[2];

            /*if (color && colors) {
                if (twoByteColor) {
                    colors[pointIndex * 4] = color[0] / 256;
                    colors[pointIndex * 4 + 1] = color[1] / 256;
                    colors[pointIndex * 4 + 2] = color[2] / 256;
                } else {
                    colors[pointIndex * 4] = color[0];
                    colors[pointIndex * 4 + 1] = color[1];
                    colors[pointIndex * 4 + 2] = color[2];
                }
                colors[pointIndex * 4 + 3] = 255;
            }*/

            intensities[pointIndex] = intensity;
            classifications[pointIndex] = classification;

            pointIndex++;
        }
    };
}

/*function detectTwoByteColors(
    decoder: any = {},
    batchSize: number,
    colorDepth?: number | string
): boolean {
    let twoByteColor = false;
    switch (colorDepth) {
        case 8:
            twoByteColor = false;
            break;
        case 16:
            twoByteColor = true;
            break;
        case 'auto':
            if (decoder.getPoint(0).color) {
                for (let i = 0; i < batchSize; i++) {
                    const { color } = decoder.getPoint(i);
                    // eslint-disable-next-line max-depth
                    if (color[0] > 255 || color[1] > 255 || color[2] > 255) {
                        twoByteColor = true;
                    }
                }
            }
            break;
        default:
            // eslint-disable-next-line
            console.warn('las: illegal value for options.las.colorDepth');
            break;
    }
    return twoByteColor;
}*/
