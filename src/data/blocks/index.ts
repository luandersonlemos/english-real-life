import type { Block } from "@/types";
import { block01 } from "./block-01";
import { block02 } from "./block-02";
import { block03 } from "./block-03";
import { block04 } from "./block-04";
import { block05 } from "./block-05";
import { block06 } from "./block-06";
import { block07 } from "./block-07";
import { block08 } from "./block-08";
import { block09 } from "./block-09";
import { block10 } from "./block-10";
import { block11 } from "./block-11";
import { block12 } from "./block-12";
import { block13 } from "./block-13";
import { block14 } from "./block-14";
import { block15 } from "./block-15";
import { block16 } from "./block-16";
import { block17 } from "./block-17";
import { block18 } from "./block-18";

export const blocks: Block[] = [
  block01,
  block02,
  block03,
  block04,
  block05,
  block06,
  block07,
  block08,
  block09,
  block10,
  block11,
  block12,
  block13,
  block14,
  block15,
  block16,
  block17,
  block18,
];

export function getBlock(id: string): Block | undefined {
  return blocks.find((b) => b.id === id);
}

export function getBlockByNumber(n: number): Block | undefined {
  return blocks.find((b) => b.number === n);
}
