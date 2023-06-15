import { LASData } from './types';

export function logStatistics(data: LASData, originalSize: number) {
    const { attributes } = data;
    const { position, intensity, classification } = attributes;

    console.log(
        `File size: ${originalSize / 1024 / 1024} MB, Memory used ${Math.round(
            (position.value.length * 4 + intensity.value.length * 4 + classification.value.length) /
                1024 /
                1024
        )} MB`
    );
}
