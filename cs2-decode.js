/**
 * CS2 Crosshair Share Code Decoder / Encoder — standalone, no DOM.
 * Reads: CS+44 (32-byte, Oct 2026) · CSGO-… (18-byte V1/V3/V4)
 */

var DICTIONARY = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefhijkmnopqrstuvwxyz23456789";
var DICT_LEN = BigInt(DICTIONARY.length);
var CODE_RE = /^(CSGO(-[\w]{5}){5}|CS[A-Za-z0-9]{44})$/;
var CS2_CODE_RE = /^CS[A-Za-z0-9]{44}$/;
var CS2_VERSION = 5;
var HUNDREDTH = Math.fround(0.01);

function hexToBytes(h) { var out = []; for (var i = 0; i < h.length; i += 2) out.push(parseInt(h.slice(i, i + 2), 16)); return out; }
function bytesToHex(b) { return b.map(function (v) { return ("0" + (v & 0xff).toString(16)).slice(-2); }).join(""); }
function uint8ToInt8(v) { return (v << 24) >> 24; }
function pct(v, offset) { var x = Math.fround(v * HUNDREDTH); return offset ? Math.fround(x + Math.fround(offset)) : x; }
function roundf(x) { return Math.sign(x) * Math.floor(Math.abs(x) + 0.5); }
function clampInt(v, lo, hi) { return Math.min(Math.max(Math.round(v), lo), hi); }
function pctText(v) { return String(Math.round(v * 100) / 100); }

function shareCodeToBytes(code) {
  if (!code.match(CODE_RE)) return null;
  var cs2 = CS2_CODE_RE.test(code);
  var chars = Array.from(cs2 ? code.slice(2) : code.replace(/CSGO|-/g, "")).reverse();
  var big = 0n;
  for (var i = 0; i < chars.length; i++) {
    var idx = DICTIONARY.indexOf(chars[i]);
    if (idx < 0) return null;
    big = big * DICT_LEN + BigInt(idx);
  }
  var hex = big.toString(16);
  var size = cs2 ? 32 : 18;
  if (hex.length > size * 2) return null;
  return hexToBytes(hex.padStart(size * 2, "0"));
}

function decodeCrosshair(code) {
  var r = shareCodeToBytes(code);
  if (!r) return null;
  var sum = r.slice(1).reduce(function (a, b) { return a + b; }, 0) & 0xff;
  if (r[0] !== sum) return null;
  if (r.length === 32) return r[1] === 1 && (r[2] | (r[3] << 8)) ? decodeCs2Crosshair(r) : null;
  if (r[1] === 1) return decodeCrosshairV1(r);
  if (r[1] === 3 || r[1] === 4) return decodePixelCrosshair(r);
  return null;
}

function decodePixelCrosshair(r) {
  var bits = r[10] | (r[11] << 8) | (r[12] << 16) | (r[13] << 24);
  var outlineMode = r[1] === 4 ? (r[13] >> 4) & 3 : ((r[2] & 0x20) ? 1 : 0);
  return {
    version: r[1], style: r[2] & 0xf,
    followRecoil: (r[2] & 0x10) === 0x10,
    centerDotEnabled: (r[2] & 0x40) === 0x40,
    tStyleEnabled: (r[2] & 0x80) === 0x80,
    red: r[3], green: r[4], blue: r[5], alpha: r[6],
    gap: r[7], length: r[8], dynamicSpreadLimit: r[9],
    splitDistance: bits & 0x7f,
    innerSplitAlpha: pct(roundf(((bits >> 7) & 0x1f) * 0.05 / 0.01)),
    outerSplitAlpha: pct(roundf(((bits >> 12) & 0xf) * 0.05 / 0.01), 0.3),
    splitSizeRatio: pct((bits >> 16) & 0x7f),
    thickness: (bits >>> 23) & 0x1f,
    screenHeight: r[14] | (r[15] << 8),
    outlineMode: outlineMode, color: 5, alphaEnabled: true,
    outlineEnabled: outlineMode !== 0, outline: outlineMode ? 1 : 0
  };
}

function decodeCs2Crosshair(r) {
  var bits = (r[18] | (r[19] << 8) | (r[20] << 16) | (r[21] << 24)) >>> 0;
  var gap = r[14] | (r[15] << 8);
  if (gap & 0x8000) gap -= 0x10000;
  var outlineMode = Math.min(r[13] >> 6, 2);
  return {
    version: CS2_VERSION,
    screenHeight: Math.max(240, r[2] | (r[3] << 8)),
    style: Math.min(r[4] & 0x1f, 9),
    followRecoil: !!(r[4] & 0x20),
    centerDotEnabled: !!(r[4] & 0x40),
    tStyleEnabled: !!(r[4] & 0x80),
    red: r[5], green: r[6], blue: r[7], alpha: r[8],
    outlineRed: r[9], outlineGreen: r[10], outlineBlue: r[11], outlineAlpha: r[12],
    thickness: Math.min(r[13] & 0x3f, 32), outlineMode: outlineMode,
    gap: Math.min(Math.max(gap, -3840), 3840),
    length: r[16], dynamicSpreadLimit: r[17],
    splitDistance: Math.min(bits & 0x7f, 127),
    innerSplitAlpha: pct(Math.min((bits >> 7) & 0x7f, 100)),
    outerSplitAlpha: pct(Math.min((bits >> 14) & 0x7f, 70), 0.3),
    splitSizeRatio: pct(Math.min((bits >> 21) & 0x7f, 100)),
    scopeDotUseColor: !!(bits & 0x10000000),
    scopeDotScale: pct(Math.min(r[22], 190), 0.1),
    color: 5, alphaEnabled: true,
    outlineEnabled: outlineMode !== 0, outline: outlineMode ? 1 : 0
  };
}

function decodeCrosshairV1(r) {
  return {
    version: 1, gap: uint8ToInt8(r[2]) / 10, outline: r[3] / 2,
    red: r[4], green: r[5], blue: r[6], alpha: r[7],
    splitDistance: r[8] & 7, followRecoil: ((r[8] >> 4) & 8) === 8,
    fixedCrosshairGap: uint8ToInt8(r[9]) / 10,
    color: r[10] & 7, outlineEnabled: (r[10] & 8) === 8,
    innerSplitAlpha: (r[10] >> 4) / 10, outerSplitAlpha: (r[11] & 0xf) / 10,
    splitSizeRatio: (r[11] >> 4) / 10, thickness: r[12] / 10,
    centerDotEnabled: ((r[13] >> 4) & 1) === 1,
    deployedWeaponGapEnabled: ((r[13] >> 4) & 2) === 2,
    alphaEnabled: ((r[13] >> 4) & 4) === 4,
    tStyleEnabled: ((r[13] >> 4) & 8) === 8,
    style: (r[13] & 0xf) >> 1, length: r[14] / 10
  };
}

function encodeCrosshair(cfg) {
  var pctByte = function (v, lo, hi) { return roundf(Math.fround(Math.fround(Math.min(Math.max(v, lo), hi) - lo) / HUNDREDTH)); };
  var alpha = clampInt(cfg.alpha, 0, 255);
  var gap = clampInt(cfg.gap, -3840, 3840) & 0xffff;
  var h = clampInt(cfg.screenHeight || 1080, 0, 65535);
  var bits = (clampInt(cfg.splitDistance, 0, 127) |
    (pctByte(cfg.innerSplitAlpha, 0, 1) << 7) |
    (pctByte(cfg.outerSplitAlpha, Math.fround(0.3), 1) << 14) |
    (pctByte(cfg.splitSizeRatio, 0, 1) << 21) |
    (cfg.scopeDotUseColor ? 0x10000000 : 0)) >>> 0;
  var oa = cfg.outlineAlpha == null ? alpha : clampInt(cfg.outlineAlpha, 0, 255);
  var bytes = [
    0, 1, h & 0xff, h >> 8,
    clampInt(cfg.style, 0, 9) | (cfg.followRecoil ? 0x20 : 0) | (cfg.centerDotEnabled ? 0x40 : 0) | (cfg.tStyleEnabled ? 0x80 : 0),
    clampInt(cfg.red, 0, 255), clampInt(cfg.green, 0, 255), clampInt(cfg.blue, 0, 255), alpha,
    clampInt(cfg.outlineRed || 0, 0, 255), clampInt(cfg.outlineGreen || 0, 0, 255),
    clampInt(cfg.outlineBlue || 0, 0, 255), oa,
    clampInt(cfg.thickness, 0, 32) | (clampInt(cfg.outlineMode, 0, 2) << 6),
    gap & 0xff, gap >> 8,
    clampInt(cfg.length, 0, 255), clampInt(cfg.dynamicSpreadLimit == null ? 255 : cfg.dynamicSpreadLimit, 0, 255),
    bits & 0xff, (bits >> 8) & 0xff, (bits >> 16) & 0xff, (bits >>> 24) & 0xff,
    pctByte(cfg.scopeDotScale == null ? 1 : cfg.scopeDotScale, Math.fround(0.1), 2),
    0, 0, 0, 0, 0, 0, 0, 0, 0
  ];
  bytes[0] = bytes.slice(1).reduce(function (a, b) { return a + b; }, 0) & 0xff;
  var total = BigInt("0x" + bytesToHex(bytes));
  var chars = "";
  for (var i = 0; i < 44; i++) { chars += DICTIONARY[Number(total % DICT_LEN)]; total = total / DICT_LEN; }
  return "CS" + chars;
}

function toConVars(cfg) {
  if (cfg.version !== 1) {
    return [
      'cl_crosshairstyle "' + cfg.style + '"',
      'cl_crosshair_length "' + cfg.length + '"',
      'cl_crosshair_thickness "' + cfg.thickness + '"',
      'cl_crosshair_gap "' + cfg.gap + '"',
      'cl_crosshairdot "' + (cfg.centerDotEnabled ? 1 : 0) + '"',
      'cl_crosshaircolor_r "' + cfg.red + '"',
      'cl_crosshaircolor_g "' + cfg.green + '"',
      'cl_crosshaircolor_b "' + cfg.blue + '"',
      'cl_crosshaircolor_a "' + cfg.alpha + '"',
      'cl_crosshair_drawoutline "' + cfg.outlineMode + '"',
      'cl_crosshairoutline_r "' + (cfg.outlineRed || 0) + '"',
      'cl_crosshairoutline_g "' + (cfg.outlineGreen || 0) + '"',
      'cl_crosshairoutline_b "' + (cfg.outlineBlue || 0) + '"',
      'cl_crosshairoutline_a "' + (cfg.outlineAlpha == null ? cfg.alpha : cfg.outlineAlpha) + '"',
      'cl_crosshair_t "' + (cfg.tStyleEnabled ? 1 : 0) + '"',
      'cl_crosshair_recoil "' + (cfg.followRecoil ? 1 : 0) + '"',
      'cl_crosshair_dynamic_spread_limit "' + cfg.dynamicSpreadLimit + '"',
      'cl_crosshair_dynamic_splitdist "' + cfg.splitDistance + '"',
      'cl_crosshair_dynamic_splitalpha_innermod "' + pctText(cfg.innerSplitAlpha) + '"',
      'cl_crosshair_dynamic_splitalpha_outermod "' + pctText(cfg.outerSplitAlpha) + '"',
      'cl_crosshair_dynamic_maxdist_splitratio "' + pctText(cfg.splitSizeRatio) + '"',
      'cl_ironsight_usecrosshaircolor "' + (cfg.scopeDotUseColor ? 1 : 0) + '"',
      'cl_ironsight_dot_scale "' + pctText(cfg.scopeDotScale) + '"'
    ].join("\n");
  }
  return [
    'cl_crosshairstyle "' + cfg.style + '"',
    'cl_crosshairsize "' + cfg.length + '"',
    'cl_crosshairthickness "' + cfg.thickness + '"',
    'cl_crosshairgap "' + cfg.gap + '"',
    'cl_crosshairdot "' + (cfg.centerDotEnabled ? 1 : 0) + '"',
    'cl_crosshaircolor "' + cfg.color + '"',
    'cl_crosshaircolor_r "' + cfg.red + '"',
    'cl_crosshaircolor_g "' + cfg.green + '"',
    'cl_crosshaircolor_b "' + cfg.blue + '"',
    'cl_crosshairusealpha "' + (cfg.alphaEnabled ? 1 : 0) + '"',
    'cl_crosshairalpha "' + cfg.alpha + '"',
    'cl_crosshair_drawoutline "' + (cfg.outlineEnabled ? 1 : 0) + '"',
    'cl_crosshair_outlinethickness "' + cfg.outline + '"',
    'cl_crosshair_t "' + (cfg.tStyleEnabled ? 1 : 0) + '"'
  ].join("\n");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { decodeCrosshair: decodeCrosshair, encodeCrosshair: encodeCrosshair, toConVars: toConVars };
}
if (typeof window !== "undefined") {
  window.CS2Decode = { decodeCrosshair: decodeCrosshair, encodeCrosshair: encodeCrosshair, toConVars: toConVars };
}