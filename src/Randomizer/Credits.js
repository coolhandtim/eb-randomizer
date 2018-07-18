import { ReadWriteObject } from 'randomtools-js';
import Cluster from './Cluster.js';
import ebutils from './ebutils.js';

class Credits extends ReadWriteObject {
    static fullCleanup() {
        super.fullCleanup();
        if(!this.context.specs.flags.a) return;

        const smallText = (str) => [0x01, ...ebutils.encodeText(str,true,1), 0x00];
        const bigText = (str) => [0x02, ...ebutils.encodeText(str,true,2), 0x00];
        const printAddr = (addr, len=1) => [0x05, ...ebutils.ccodeAddress(addr), len];

        const newCredits = [
            3, 2,
            ...bigText("STATISTICS"),
            ...bigText("__________"),
            3, 2,
            ...smallText("CAVE LENGTH"),
            ...bigText(Math.floor(Cluster.goal.rank).toString()),
            3, 2,
            ...smallText("YOUR DOOR TRANSITIONS"),
            ...printAddr(0x7E9B4A, 2),
            3, 2,
            ...smallText("NESS LEVEL"),
            ...printAddr(0x7e99d3),
            3, 2,
            ...smallText("MONEY IN BANK"),
            ...printAddr(0x7e9835, 4),
            3, 2,
            ...smallText("MONEY ON HAND"),
            ...printAddr(0x7e9831, 4),
            3, 6,
            ...bigText("RANDOMIZER"),
            ...bigText("__________"),
            3, 2,
            ...smallText("WEBSITE"),
            ...bigText("EARTHBOUND.APP"),
            3, 2,
            ...smallText("VERSION"),
            ...bigText(this.context.specs.version),
            3, 2,
            ...smallText("SEED"),
            ...bigText(this.context.specs.seed.toString()),
            3, 2,
            ...smallText("FLAGS"),
            ...bigText(ebutils.flagString(this.context.specs.flags)
                .toUpperCase().replace(/\(|\)/g,"*")),
            3, 2,
            ...smallText("LEAD DEVELOPER"),
            ...bigText("PICKFIFTEEN"),
            3, 2,
            ...smallText("LEAD PLAYTESTER"),
            ...bigText("TSJONTE"),
            3, 6,
            ...bigText("ORIGINAL GAME"), // Condensed
            ...bigText("_____________"),
            0x03,0x02,0x01,0x5B,0x7A,0x4B,0x54,0x6C,0x44,0x45,0x54,0x40,0x42,0x5A,0x54,0x40,0x54,0x48,0x7A,0x45,0x44,0x7B,0x45,0x54,0x40,0x52,0x6E,0x00,0x02,0xA3,0x88,0x89,0x87,0x85,0xA3,0x81,0xA4,0x8F,0x40,0x89,0xA4,0x8F,0x89,0x00,0x03,0x02,0x01,0x6D,0x7A,0x48,0x7B,0x7B,0x45,0x5A,0x40,0x52,0x6E,0x00,0x02,0xA3,0x88,0x89,0x87,0x85,0xA3,0x81,0xA4,0x8F,0x40,0x89,0xA4,0x8F,0x89,0x00,0x03,0x02,0x01,0x4A,0x6C,0x6B,0x48,0x44,0x40,0x52,0x6E,0x00,0x02,0x8B,0x85,0x89,0x89,0x83,0x88,0x89,0x40,0xA3,0xA5,0xAA,0xA5,0x8B,0x89,0x00,0x02,0x88,0x89,0xA2,0x8F,0x8B,0x81,0xAA,0xA5,0x40,0xA4,0x81,0x8E,0x81,0x8B,0x81,0x00,0x03,0x06,0x01,0x46,0x42,0x4A,0x45,0x40,0x54,0x45,0x6B,0x48,0x46,0x5A,0x45,0x7A,0x00,0x02,0x81,0x8B,0x89,0x88,0x89,0x8B,0x8F,0x40,0x8D,0x89,0xA5,0xA2,0x81,0x00,0x03,0x02,0x01,0x42,0x7A,0x7B,0x40,0x54,0x48,0x7A,0x45,0x44,0x7B,0x4B,0x7A,0x00,0x02,0x8B,0x8F,0xA5,0x89,0x83,0x88,0x89,0x40,0x8F,0x8F,0xA9,0x81,0x8D,0x81,0x00,0x03,0x02,0x01,0x6B,0x4B,0x6C,0x5A,0x54,0x40,0x54,0x48,0x7A,0x45,0x44,0x7B,0x4B,0x7A,0x00,0x02,0x88,0x89,0xA2,0x8F,0x8B,0x81,0xAA,0xA5,0x40,0xA4,0x81,0x8E,0x81,0x8B,0x81,0x00,0x03,0x02,0x01,0x5B,0x7A,0x4B,0x46,0x7A,0x42,0x4A,0x40,0x54,0x48,0x7A,0x45,0x44,0x7B,0x4B,0x7A,0x00,0x02,0xA3,0x81,0xA4,0x8F,0xA2,0xA5,0x40,0x89,0xA7,0x81,0xA4,0x81,0x00,0x03,0x02,0x01,0x6C,0xAD,0x6B,0xAD,0x40,0x44,0x4B,0x5A,0x7C,0x45,0x7A,0x6B,0x48,0x4B,0x5A,0x40,0x54,0x48,0x7A,0x45,0x44,0x7B,0x4B,0x7A,0x00,0x02,0x8B,0x8F,0xA5,0x8A,0x89,0x40,0x8D,0x81,0x8C,0xA4,0x81,0x00,0x03,0x02,0x01,0x7B,0x7A,0x42,0x5A,0x6B,0x59,0x42,0x7B,0x48,0x4B,0x5A,0x40,0x54,0x48,0x7A,0x45,0x44,0x7B,0x4B,0x7A,0x6B,0x00,0x02,0x8D,0x81,0xA2,0x83,0xA5,0xA3,0x40,0x8C,0x89,0x8E,0x84,0x82,0x8C,0x8F,0x8D,0x00,0x02,0x8D,0x81,0xA3,0x81,0xA9,0xA5,0x8B,0x89,0x40,0x8D,0x89,0xA5,0xA2,0x81,0x00,0x03,0x06,0x01,0x44,0x56,0x48,0x45,0x55,0x40,0x44,0x4B,0x4B,0x7A,0x54,0x48,0x5A,0x42,0x7B,0x4B,0x7A,0x00,0x02,0x8D,0x81,0xA2,0x83,0xA5,0xA3,0x40,0x8C,0x89,0x8E,0x84,0x82,0x8C,0x8F,0x8D,0x00,0x03,0x06,0x01,0x59,0x48,0x5A,0x45,0x40,0x5B,0x7A,0x4B,0x54,0x6C,0x44,0x45,0x7A,0x00,0x02,0xA4,0xA3,0xA5,0x8E,0x85,0x8B,0x81,0xAA,0x40,0x89,0xA3,0x88,0x89,0x88,0x81,0xA2,0x81,0x00,0x03,0x06,0x01,0x44,0x4B,0x5B,0x7A,0x4B,0x54,0x6C,0x44,0x45,0x7A,0x00,0x02,0xA3,0x81,0xA4,0x8F,0xA2,0xA5,0x40,0x89,0xA7,0x81,0xA4,0x81,0x00,0x03,0x06,0x01,0x5A,0x4B,0x42,0x40,0x5B,0x7A,0x4B,0x54,0x6C,0x44,0x45,0x7A,0x00,0x02,0x8D,0x89,0x8B,0x85,0x40,0x86,0xA5,0x8B,0xA5,0x84,0x81,0x00,0x03,0x06,0x01,0x6B,0x6C,0x5B,0x45,0x7A,0x7C,0x48,0x6B,0x4B,0x7A,0x00,0x02,0xA3,0x88,0x89,0x87,0x85,0xA2,0xA5,0x40,0x8D,0x89,0xA9,0x81,0x8D,0x8F,0xA4,0x8F,0x00,0x03,0x06,0x01,0x45,0x7D,0x45,0x44,0x6C,0x7B,0x48,0x7C,0x45,0x40,0x5B,0x7A,0x4B,0x54,0x6C,0x44,0x45,0x7A,0x6B,0x00,0x02,0x88,0x89,0xA2,0x8F,0xA3,0x88,0x89,0x40,0xA9,0x81,0x8D,0x81,0xA5,0x83,0x88,0x89,0x00,0x02,0x8D,0x89,0x8E,0x8F,0xA2,0xA5,0x40,0x81,0xA2,0x81,0x8B,0x81,0xA7,0x81,0x00,0x03,0x06,0x01,0x5B,0x7A,0x45,0x6B,0x45,0x5A,0x7B,0x45,0x54,0x40,0x52,0x6E,0x00,0x02,0x8E,0x89,0x8E,0xA4,0x85,0x8E,0x84,0x8F,0x00,0x03,0x02,0x01,0x48,0x5A,0x40,0x42,0x6B,0x6B,0x4B,0x44,0x48,0x42,0x7B,0x48,0x4B,0x5A,0x40,0x6D,0x48,0x7B,0x56,0x00,0x02,0x81,0xA0,0x85,0x40,0x89,0x8E,0x83,0x4E,0x00,0x03,0x02,0x01,0x42,0x5A,0x54,0x00,0x02,0x88,0x81,0x8C,0x40,0x8C,0x81,0x82,0x8F,0xA2,0x81,0xA4,0x8F,0xA2,0xA9,0x4C,0x89,0x8E,0x83,0x4E,0x00,
            0x03,0x0C,0x01,0x42,0x5A,0x54,0xAD,0xAD,0xAD,0x00,0x01,0x40,0x00,0x03,0x0E,0x01,0x5B,0x59,0x42,0x6E,0x45,0x7A,0x00,
            0x04,
            0x3, 0x0D,
            0xFF, // Terminator. TODO: Determine what stops scrolling.
        ];
        if(newCredits.length + this.beginAddress > this.endAddress) {
            throw new Error(`Credits length ${newCredits.length} too long.`);
        }
        this.context.rom.set(newCredits, this.beginAddress);

        const newScrollLength = [0xf0, 0x07];
        this.scrollAddresses.forEach(scrollAddress => {
            this.context.rom.set(newScrollLength, scrollAddress);
        });
    }
}

Credits.beginAddress = 0x21413f;
Credits.endAddress = 0x214DE7;
Credits.scrollAddresses = [
    0x4f583,
    0x4f58c,
    0x4f66f,
]

Credits._displayName = "credits";
export default Credits;