export interface Palette {
  id: string;
  name: string;
  category: 'all' | 'handheld' | 'console' | 'pc' | 'creative';
  categoryLabel: string;
  era?: string;
  colors: string[];
  description: string;
}

export const PALETTE_CATEGORIES = [
  { id: 'all', label: 'All Palettes' },
  { id: 'handheld', label: 'Handhelds' },
  { id: 'console', label: 'Classic Consoles' },
  { id: 'pc', label: 'Vintage PC & OS' },
  { id: 'creative', label: 'Indie & Aesthetic' },
] as const;

export const CLASSIC_PALETTES: Palette[] = [
  {
    id: 'original',
    name: 'Original Colors',
    category: 'all',
    categoryLabel: 'True Color',
    era: 'Modern',
    colors: [],
    description: 'Original 24-bit image colors preserved without palette quantization restrictions.'
  },
  {
    id: 'gameboy',
    name: 'Game Boy DMG',
    category: 'handheld',
    categoryLabel: 'Handheld',
    era: '1989',
    colors: [
      '#0f380f', '#306230', '#8bac0f', '#9bbc0f'
    ],
    description: "Released in 1989, Nintendo Game Boy's iconic green-tinted 4-shade LCD screen defined portable gaming with titles like Tetris and Pokémon."
  },
  {
    id: 'gameboy_pocket',
    name: 'Game Boy Pocket',
    category: 'handheld',
    categoryLabel: 'Handheld',
    era: '1996',
    colors: [
      '#1b1b1b', '#5c5c5c', '#a2a2a2', '#f3f3f3'
    ],
    description: 'The Game Boy Pocket improved on the original DMG by replacing the pea-soup green screen with a crisp, high-contrast monochrome LCD.'
  },
  {
    id: 'gamegear',
    name: 'Sega Game Gear',
    category: 'handheld',
    categoryLabel: 'Handheld',
    era: '1990',
    colors: [
      '#000000', '#0000AA', '#00AA00', '#00AAAA',
      '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA',
      '#555555', '#5555FF', '#55FF55', '#55FFFF',
      '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'
    ],
    description: "Sega's full-color portable powerhouse featured a backlit 4096-color master palette displaying up to 32 simultaneous vibrant colors."
  },
  {
    id: 'pico8',
    name: 'PICO-8',
    category: 'creative',
    categoryLabel: 'Fantasy Console',
    era: 'Modern Indie',
    colors: [
      '#000000', '#1D2B53', '#7E2553', '#008751',
      '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8',
      '#FF004D', '#FFA300', '#FFEC27', '#00E436',
      '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA'
    ],
    description: 'Joseph White created the PICO-8 fantasy console in 2015 with this beloved 16-color palette that sparked a worldwide indie pixel art revival.'
  },
  {
    id: 'nes',
    name: 'NES / Famicom',
    category: 'console',
    categoryLabel: 'Console',
    era: '1983',
    colors: [
      '#7C7C7C', '#0000FC', '#0000BC', '#4428BC',
      '#940084', '#A80020', '#A81000', '#881400',
      '#503000', '#007800', '#006800', '#005800',
      '#004058', '#000000', '#BCBCBC', '#0078F8',
      '#0058F8', '#6844FC', '#D800CC', '#E40058',
      '#F83800', '#E45C10', '#AC7C00', '#00B800',
      '#00A800', '#00A844', '#008888', '#F8F8F8',
      '#3CBCFC', '#6888FC', '#9878F8', '#F878F8',
      '#F85898', '#F87858', '#FCA044', '#F8B800',
      '#B8F818', '#58D854', '#58F898', '#00E8D8',
      '#787878', '#FCFCFC', '#A4E4FC', '#B8B8F8',
      '#D8B8F8', '#F8A4C0', '#F0D0B0', '#FCE0A8',
      '#F8D878', '#D8F878', '#B8F8B8', '#00FCFC'
    ],
    description: 'The Nintendo Entertainment System featured a custom Picture Processing Unit capable of 54 colors tailored for 1980s CRT television sets.'
  },
  {
    id: 'mastersystem',
    name: 'Sega Master System',
    category: 'console',
    categoryLabel: 'Console',
    era: '1985',
    colors: [
      '#000000', '#550000', '#AA0000', '#FF0000',
      '#005500', '#555500', '#AA5500', '#FF5500',
      '#00AA00', '#55AA00', '#AAAA00', '#FFAA00',
      '#00FF00', '#55FF00', '#AAFF00', '#FFFF00',
      '#000055', '#550055', '#AA0055', '#FF0055',
      '#005555', '#555555', '#AA5555', '#FF5555',
      '#00AA55', '#55AA55', '#AAAA55', '#FFAA55',
      '#00FF55', '#55FF55', '#AAFF55', '#FFFF55'
    ],
    description: "Sega's 8-bit home console sported a rich 64-color master palette with 32 simultaneous on-screen colors, outperforming the NES in raw color saturation."
  },
  {
    id: 'atari2600',
    name: 'Atari 2600 (NTSC)',
    category: 'console',
    categoryLabel: 'Console',
    era: '1977',
    colors: [
      '#000000', '#404040', '#6C6C6C', '#909090', '#B0B0B0', '#C8C8C8', '#DCDCDC', '#ECECEC',
      '#444400', '#646410', '#848424', '#A0A034', '#B8B840', '#D0D050', '#E8E85C', '#FCFC68',
      '#702800', '#844414', '#985C28', '#AC763C', '#C08C50', '#D4A060', '#E8B474', '#FCC888',
      '#841400', '#983014', '#AC4C28', '#C06438', '#D47C48', '#E8945C', '#FCAC6C', '#FCC07C',
      '#880000', '#9C2014', '#B03C28', '#C05838', '#D0704C', '#E48860', '#F8A074', '#FCB484',
      '#78005C', '#8C186C', '#A02C7C', '#B4408C', '#C8549C', '#DC68AC', '#F07CBC', '#FC8ECC',
      '#480078', '#5C1488', '#702898', '#843CA8', '#9850B8', '#AC64C8', '#C078D8', '#D48CE8',
      '#140084', '#281894', '#3C2CA4', '#5040B4', '#6454C4', '#7868D4', '#8C7CE4', '#A090F4',
      '#001888', '#142C98', '#2840A8', '#3C54B8', '#5068C8', '#647CD8', '#7890E8', '#8CA4F8',
      '#003878', '#144C88', '#286098', '#3C74A8', '#5088B8', '#649CC8', '#78B0D8', '#8CC4E8',
      '#004C44', '#146054', '#287464', '#3C8874', '#509C84', '#64B094', '#78C4A4', '#8CD8B4',
      '#005814', '#146C24', '#288034', '#3C9444', '#50A854', '#64BC64', '#78D074', '#8CE484'
    ],
    description: 'The legendary Atari VCS featured 128 colors through its Television Interface Adaptor (TIA) generated via phase-shift analog NTSC tinting.'
  },
  {
    id: 'cga',
    name: 'CGA Mode 4 (Cyan/Magenta)',
    category: 'pc',
    categoryLabel: 'PC / Retro',
    era: '1981',
    colors: [
      '#000000', '#55FFFF', '#FF55FF', '#FFFFFF'
    ],
    description: "IBM's 1981 Color Graphics Adapter Mode 4 palette became the hallmark of early MS-DOS gaming like Commander Keen, King's Quest, and Rogue."
  },
  {
    id: 'commodore64',
    name: 'Commodore 64 (VIC-II)',
    category: 'pc',
    categoryLabel: 'Home Computer',
    era: '1982',
    colors: [
      '#000000', '#FFFFFF', '#880000', '#AAFFEE',
      '#CC44CC', '#00CC55', '#0000AA', '#EEEE77',
      '#DD8855', '#664400', '#FF7777', '#333333',
      '#777777', '#AAFF66', '#0088FF', '#BBBBBB'
    ],
    description: 'The best-selling computer model in history featured the VIC-II graphics chip with 16 distinctive warm, muted, and earthy hues.'
  },
  {
    id: 'zxspectrum',
    name: 'ZX Spectrum',
    category: 'pc',
    categoryLabel: 'Home Computer',
    era: '1982',
    colors: [
      '#000000', '#0000D7', '#D70000', '#D700D7',
      '#00D700', '#00D7D7', '#D7D700', '#D7D7D7',
      '#0000FF', '#FF0000', '#FF00FF', '#00FF00',
      '#00FFFF', '#FFFF00', '#FFFFFF'
    ],
    description: "Sir Clive Sinclair's British microcomputer brought vibrant 8-color computing to homes with its bold primary hues and iconic attribute clash."
  },
  {
    id: 'msdos',
    name: 'MS-DOS Grayscale 16',
    category: 'pc',
    categoryLabel: 'PC / Monochrome',
    era: '1980s',
    colors: [
      '#000000', '#111111', '#222222', '#333333',
      '#444444', '#555555', '#666666', '#777777',
      '#888888', '#999999', '#AAAAAA', '#BBBBBB',
      '#CCCCCC', '#DDDDDD', '#EEEEEE', '#FFFFFF'
    ],
    description: 'The standard 16-shade monochrome ramp for text-mode displays, phosphor monitors, and classic ASCII/ANSI terminal art.'
  },
  {
    id: 'win95',
    name: 'Windows 95 / Web Safe',
    category: 'pc',
    categoryLabel: 'Operating System',
    era: '1995',
    colors: [
      '#000000', '#800000', '#008000', '#808000',
      '#000080', '#800080', '#008080', '#C0C0C0',
      '#808080', '#FF0000', '#00FF00', '#FFFF00',
      '#0000FF', '#FF00FF', '#00FFFF', '#FFFFFF',
      '#330000', '#333300', '#336600', '#339900', '#33CC00', '#33FF00',
      '#660000', '#663300', '#666600', '#669900', '#66CC00', '#66FF00',
      '#990000', '#993300', '#996600', '#999900', '#99CC00', '#99FF00',
      '#CC0000', '#CC3300', '#CC6600', '#CC9900', '#CCCC00', '#CCFF00',
      '#FF0000', '#FF3300', '#FF6600', '#FF9900', '#FFCC00', '#FFFF00',
      '#003366', '#006699', '#0099CC', '#00CCFF', '#3399FF', '#66B2FF',
      '#330066', '#660099', '#9900CC', '#CC00FF', '#FF3399', '#FF66B2'
    ],
    description: 'The foundational 256-color VGA space that defined Windows 95 multimedia, Netscape Navigator, and early internet aesthetics.'
  },
  {
    id: 'endesga32',
    name: 'EDG 32 (Endesga)',
    category: 'creative',
    categoryLabel: 'Pixel Art Standard',
    era: 'Modern',
    colors: [
      '#be4a2f', '#d77643', '#ead4aa', '#e4a672',
      '#b86f56', '#733e39', '#3e2731', '#a22633',
      '#e43b44', '#f77622', '#feae34', '#fee761',
      '#63c74d', '#3e8948', '#265c42', '#193c3e',
      '#124e89', '#0099db', '#2ce8f5', '#ffffff',
      '#c0cbdc', '#8b9bb4', '#5a6988', '#3a4466',
      '#262b44', '#181425', '#ff0044', '#68386c',
      '#b55088', '#f6757a', '#e8b796', '#c28569'
    ],
    description: "Designed by Brazilian pixel artist Endesga, this balanced 32-color palette is one of the most widely used palettes in modern pixel art and game jams."
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    category: 'creative',
    categoryLabel: 'Synthwave',
    era: 'Aesthetic',
    colors: [
      '#0d0221', '#0f084b', '#26408b', '#0d0887',
      '#6a00a8', '#b122e0', '#f127a8', '#ff007f',
      '#ff0055', '#ff5400', '#ffaa00', '#05ffa1',
      '#00f0ff', '#7000ff', '#e0e0e0', '#ffffff'
    ],
    description: 'High-voltage electric purples, neon magentas, and cyan highlights straight out of 1980s anime and dystopian cyberpunk streets.'
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave Sunset',
    category: 'creative',
    categoryLabel: 'Pastel Retro',
    era: 'Aesthetic',
    colors: [
      '#2b1055', '#591a75', '#8c2278', '#c93384',
      '#f25c8e', '#ff8aa5', '#ffb9bd', '#ffe6e8',
      '#210b42', '#3f1651', '#245a7a', '#349090',
      '#5ac3b0', '#8be3c9', '#c4f5ea', '#ffffff'
    ],
    description: 'Dreamy pastel gradients, mall nostalgia, and Aegean teal tones for retro internet and lo-fi aesthetics.'
  }
];
