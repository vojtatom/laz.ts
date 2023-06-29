import { LASData } from './types';

export function adjust(data: LASData) {
    //find centroid
    const positions = data.attributes.position.value as Int32Array;
    if (!positions) return;

    const center = [0, 0, 0];
    for (let i = 0; i < positions.length; i++) center[i % 3] += positions[i];

    //update centroid so that it is only the non-decimal part shifted
    const scale = data.header.scale;
    center[0] /= positions.length / 3;
    center[0] = Math.round(Math.round(center[0] * scale[0]) / scale[0]);
    center[1] /= positions.length / 3;
    center[1] = Math.round(Math.round(center[1] * scale[1]) / scale[1]);
    center[2] /= positions.length / 3;
    center[2] = Math.round(Math.round(center[2] * scale[2]) / scale[2]);

    console.log(center);

    //adjust
    for (let i = 0; i < positions.length; i++) positions[i] -= center[i % 3];

    //update header
    data.header.offset[0] += Math.round(center[0] * scale[0]);
    data.header.offset[1] += Math.round(center[1] * scale[1]);
    data.header.offset[2] += Math.round(center[2] * scale[2]);
}
