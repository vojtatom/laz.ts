import fs from 'fs';

function toArrayBuffer(buffer: Buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return arrayBuffer;
}

export function openFileAsArray(file: string) {
    const buffer = Buffer.from(fs.readFileSync(file, { encoding: 'binary' }), 'binary');
    return toArrayBuffer(buffer);
}
