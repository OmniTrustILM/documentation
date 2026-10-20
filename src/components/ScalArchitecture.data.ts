export type ScalView = 'scal1' | 'scal2' | 'integration';
type Icon = 'users' | 'signer' | 'document' | 'application' | 'module';
export type ScalEntity = {
  id: string;
  name: string;
  parent?: string;
  boundary?: boolean;
  icon?: Icon;
  x: number;
  y: number;
  width: number;
  height: number;
  lines: readonly string[];
};
export type ScalExchange = {
  from: string;
  to: string;
  both?: boolean;
  label?: string;
  path: string;
  caption?: {x: number; y: number; lines: readonly string[]};
  activation?: boolean;
};
export type ScalModel = {
  title: string;
  explanation: string;
  height: number;
  entities: readonly ScalEntity[];
  exchanges: readonly ScalExchange[];
  band: {x: number; y: number; width: number; height: number; lines: readonly string[]};
};

const dtbs = 'DTBS (Data To Be Signed)';
const sap =
  'SAP (Signature Activation Protocol); SAD (Signature Activation Data); DTBS (Data To Be Signed)';
const commonEntities: ScalEntity[] = [
  {
    id: 'sca',
    name: 'SCA (Signature Creation Application)',
    x: 315,
    y: 20,
    width: 310,
    height: 72,
    lines: ['SCA', 'Signature Creation Application'],
  },
  {
    id: 'device',
    name: "Unprotected environment (user's device)",
    boundary: true,
    x: 20,
    y: 150,
    width: 365,
    height: 570,
    lines: ['Unprotected environment', "User's device"],
  },
  {
    id: 'tsp',
    name: 'TSP protected environment',
    boundary: true,
    x: 420,
    y: 150,
    width: 500,
    height: 570,
    lines: ['TSP protected environment', 'Trustworthy system supporting', 'server signing'],
  },
  {
    id: 'user',
    name: 'Signer',
    parent: 'device',
    icon: 'signer',
    x: 40,
    y: 270,
    width: 85,
    height: 240,
    lines: ['Signer'],
  },
  {
    id: 'ui',
    name: 'User interface',
    parent: 'device',
    icon: 'document',
    x: 245,
    y: 230,
    width: 120,
    height: 360,
    lines: ['User interface'],
  },
  {
    id: 'ssa',
    name: 'SSA (Server Signing Application)',
    parent: 'tsp',
    icon: 'application',
    x: 440,
    y: 230,
    width: 130,
    height: 360,
    lines: ['SSA', 'Server Signing', 'Application'],
  },
  {
    id: 'qscd',
    name: 'Tamper protected environment (QSCD)',
    parent: 'tsp',
    boundary: true,
    x: 600,
    y: 230,
    width: 300,
    height: 360,
    lines: ['Tamper protected environment', 'QSCD'],
  },
  {
    id: 'ra',
    name: 'RA (Registration Authority)',
    x: 40,
    y: 785,
    width: 230,
    height: 64,
    lines: ['RA', 'Registration Authority'],
  },
  {
    id: 'ca',
    name: 'CA (Certification Authority)',
    x: 670,
    y: 785,
    width: 230,
    height: 64,
    lines: ['CA', 'Certification Authority'],
  },
];
const commonExchanges: ScalExchange[] = [
  {from: 'sca', to: 'ui', both: true, path: 'M365 92 V116 H305 V230'},
  {from: 'sca', to: 'ssa', both: true, path: 'M575 92 V116 H505 V230'},
  {
    from: 'user',
    to: 'ui',
    both: true,
    label: 'Document / data',
    path: 'M125 330 H245',
    caption: {x: 185, y: 300, lines: ['Document /', 'data']},
  },
  {from: 'ra', to: 'ui', both: true, path: 'M155 785 V753 H8 V560 H245'},
  {from: 'ca', to: 'ssa', both: true, path: 'M785 785 V753 H932 V219 H570 V230'},
  {from: 'ra', to: 'ca', both: true, path: 'M270 817 H670'},
];

function assuranceModel(level: 1 | 2): ScalModel {
  const isScal2 = level === 2;
  const modules: ScalEntity[] = isScal2
    ? [
        {
          id: 'sic',
          name: 'SIC (Signer Interaction Component)',
          parent: 'ui',
          x: 252,
          y: 470,
          width: 106,
          height: 98,
          lines: ['SIC', 'Signer', 'Interaction', 'Component'],
        },
        {
          id: 'sam',
          name: 'SAM (Signature Activation Module)',
          parent: 'qscd',
          x: 615,
          y: 320,
          width: 126,
          height: 240,
          lines: ['SAM', 'Signature', 'Activation Module'],
        },
        {
          id: 'cm',
          name: 'CM (Cryptographic Module)',
          parent: 'qscd',
          x: 758,
          y: 320,
          width: 126,
          height: 240,
          lines: ['CM', 'Cryptographic', 'Module'],
        },
      ]
    : [
        {
          id: 'cm',
          name: 'CM (Cryptographic Module)',
          parent: 'qscd',
          x: 625,
          y: 320,
          width: 250,
          height: 240,
          lines: ['CM', 'Cryptographic Module'],
        },
      ];
  return {
    title: `SCAL${level} signing architecture`,
    explanation: isScal2
      ? 'The signer activates the key through the SIC and protected SAP exchange with the SAM. The SAM and cryptographic module are inside the QSCD; the SSA is outside it.'
      : 'The server signing application handles signature activation outside the QSCD. The cryptographic module is inside the QSCD.',
    height: 870,
    entities: [...commonEntities, ...modules],
    exchanges: [
      ...commonExchanges,
      {
        from: 'user',
        to: 'ui',
        both: true,
        label: isScal2 ? 'Authentication; 2FA' : 'Authentication',
        path: 'M125 440 H245',
        caption: {x: 185, y: 412, lines: isScal2 ? ['Authentication', '2FA'] : ['Authentication']},
      },
      {
        from: 'cm',
        to: 'ssa',
        label: 'Signature value',
        path: 'M820 430 H505',
        caption: {x: 665, y: 412, lines: ['Signature value']},
      },
      ...(isScal2
        ? [
            {
              from: 'ssa',
              to: 'sam',
              label: dtbs,
              path: 'M505 500 H678',
              caption: {x: 588, y: 482, lines: ['DTBS']},
            },
            {
              from: 'sam',
              to: 'cm',
              label: dtbs,
              path: 'M678 540 H820',
              caption: {x: 772, y: 522, lines: ['DTBS']},
            },
            {
              from: 'sic',
              to: 'sam',
              both: true,
              label: sap,
              path: 'M305 568 V675 H678 V560',
              activation: true,
            },
          ]
        : [
            {
              from: 'ssa',
              to: 'cm',
              label: dtbs,
              path: 'M505 500 H750',
              caption: {x: 660, y: 482, lines: ['DTBS']},
            },
            {
              from: 'ui',
              to: 'ssa',
              both: true,
              label: `Signature activation; ${dtbs}`,
              path: 'M305 590 V665 H505 V590',
              activation: true,
            },
          ]),
    ],
    band: {
      x: 245,
      y: 610,
      width: isScal2 ? 496 : 325,
      height: 95,
      lines: isScal2
        ? [
            'SAP · Signature Activation Protocol',
            'SAD · Signature Activation Data',
            'DTBS · Data To Be Signed',
          ]
        : ['Signature activation', 'DTBS · Data To Be Signed'],
    },
  };
}

const integration: ScalModel = {
  title: 'SAMCryptoToken integration architecture',
  explanation:
    'The signing component requests SAD through the signing back-end. The SIC exchanges SAD and DTBS with the SAM using SAP, while signing requests and signature values use separate routes.',
  height: 610,
  entities: [
    {
      id: 'user',
      name: 'Users',
      icon: 'users',
      x: 15,
      y: 50,
      width: 125,
      height: 530,
      lines: ['Users'],
    },
    {
      id: 'ui',
      name: 'User interface',
      icon: 'document',
      x: 185,
      y: 50,
      width: 150,
      height: 530,
      lines: ['User interface'],
    },
    {
      id: 'backend',
      name: 'Signing logic / signing back-end',
      icon: 'application',
      x: 375,
      y: 50,
      width: 160,
      height: 530,
      lines: ['Signing logic /', 'signing back-end'],
    },
    {
      id: 'signing',
      name: 'Signing',
      icon: 'application',
      x: 575,
      y: 50,
      width: 150,
      height: 530,
      lines: ['Signing'],
    },
    {
      id: 'sam',
      name: 'SAM (Signature Activation Module)',
      icon: 'module',
      x: 765,
      y: 50,
      width: 160,
      height: 530,
      lines: ['SAM', 'Signature', 'Activation Module'],
    },
    {
      id: 'sic',
      name: 'SIC (Signer Interaction Component)',
      parent: 'ui',
      x: 195,
      y: 425,
      width: 130,
      height: 110,
      lines: ['SIC', 'Signer Interaction', 'Component'],
    },
  ],
  exchanges: [
    {
      from: 'user',
      to: 'ui',
      both: true,
      label: 'Document / data',
      path: 'M105 220 H260',
      caption: {x: 176, y: 184, lines: ['Document /', 'data']},
    },
    {
      from: 'user',
      to: 'ui',
      both: true,
      label: 'Authentication; 2FA',
      path: 'M105 340 H260',
      caption: {x: 176, y: 305, lines: ['Authentication', '2FA']},
    },
    {
      from: 'signing',
      to: 'backend',
      label: 'SAD request',
      path: 'M650 170 H455',
      caption: {x: 552, y: 153, lines: ['SAD request']},
    },
    {
      from: 'backend',
      to: 'ui',
      label: 'SAD request',
      path: 'M455 170 H260',
      caption: {x: 357, y: 153, lines: ['SAD request']},
    },
    {
      from: 'ui',
      to: 'signing',
      label: 'Signing request',
      path: 'M260 380 H650',
      caption: {x: 455, y: 362, lines: ['Signing request']},
    },
    {
      from: 'sam',
      to: 'signing',
      label: 'Signature value',
      path: 'M845 340 H650',
      caption: {x: 748, y: 322, lines: ['Signature value']},
    },
    {from: 'sic', to: 'sam', both: true, label: sap, path: 'M325 530 H845', activation: true},
  ],
  band: {
    x: 185,
    y: 420,
    width: 740,
    height: 145,
    lines: [
      'SAP · Signature Activation Protocol',
      'SAD · Signature Activation Data',
      'DTBS · Data To Be Signed',
    ],
  },
};

export const scalModels: Record<ScalView, ScalModel> = {
  scal1: assuranceModel(1),
  scal2: assuranceModel(2),
  integration,
};
