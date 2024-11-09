import fs from 'fs';

const XOR_KEY = 0xAF;
let args = process.argv.slice(2);
const flags = {
    copy: (() => {
        if (args.includes('-c')) {
            args = args.filter(x => x !== '-c');
            return true;
        }
        return false;
    })(),
    mode: (() => {
        if (args.includes('-e')) {
            return "encode";
        } else {
            return "decode";
        }
    })()
};

function encode() {
    const file = fs.readFileSync(args[0]);
    const ogfiletype = args[0].split('.')[1].padEnd(16,'\0');
    const mimetype = 'application/x-sgi-file'.padEnd(32,'\0');
    const output = Buffer.concat([
        Buffer.from(ogfiletype),
        Buffer.from(mimetype),
        Buffer.from(file.map(x => x ^ XOR_KEY))
    ])

    if(!file.copy) {
        fs.writeFileSync(args[0], output);
    } else {
        fs.writeFileSync(`${args[0]}.sgi`, output);
    }
}

function decode() {
    const file = fs.readFileSync(args[0]);
    const ogfiletype = file.subarray(0,16).toString();
    const mimetype = file.subarray(16,48).toString().replace(/\0/g,"")
    if(mimetype !== 'application/x-sgi-file') {
        console.log("Invalid file: Not an sgi file")
        process.exit(1)
    }

    const output = file.subarray(48).map(x => x ^ XOR_KEY);
    if(!flags.copy) {
        fs.writeFileSync(args[0], output);
    } else {
        fs.writeFileSync(`${args[0]}.${ogfiletype.replace(/\0/g,"")}`, output);
    }
}

if (flags.mode === "encode") {
    encode();
} else {
    decode();
}