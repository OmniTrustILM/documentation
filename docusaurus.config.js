const lightCodeTheme = require('prism-react-renderer').themes.github;
const darkCodeTheme = require('prism-react-renderer').themes.dracula;

const apiVersion = 'main';
const chartVersion = '2.17.0';
const cscVersion = '1.7.0';

import remarkFindReplacePlugin from './src/plugins/remarkFindReplacePlugin.mjs';
import remarkSimplePlantumlPlugin from './src/plugins/remarkSimplePlantumlPlugin.mjs';


/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'ILM Documentation',
  tagline: 'Security and trust assurance and automation in ever connected world',
  url: 'https://docs.otilm.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/ot-sign-color.svg',
  organizationName: 'OmniTrustILM', // Usually your GitHub org/user name.
  projectName: 'documentation', // Usually your repo name.
  trailingSlash: false,

  markdown: {
    mdx1Compat: {
      comments: false,
      admonitions: false,
      headingIds: false,
    },
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // plugins: [
  //     './src/plugins/test'
  // ],
  plugins: [
    [
      "docusaurus-plugin-remote-content",
      {
        // options here
        name: "helm-docs", // used by CLI, must be path safe
        noRuntimeDownloads: true, // disable runtime downloads, use only CLI to download (docusaurus download-remote-helm-docs)
        performCleanup: false, // do not remove downloaded files on build
        sourceBaseUrl: "https://raw.githubusercontent.com/OmniTrustILM/helm-charts/"+chartVersion+"/charts/ilm/docs/", // the base url for the markdown (gets prepended to all of the documents when fetching)
        outDir: "docs/certificate-key/installation-guide/deployment/deployment-helm", // the base directory to output to.
        documents: ["configurable-parameters.md", "overview.md", "troubleshooting.md", "upgrading.md"], // the file names to download
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'problems',
        path: 'problems',
        routeBasePath: 'problems',
        sidebarPath: require.resolve('./sidebarProblems.js'),
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            to: '/docs',
            from: '/test',
          },
        ],
        createRedirects: function (existingPath) {
          // do not redirect root
          if (existingPath === '/') {
            return undefined;
          }
          if (existingPath.endsWith('/')) {
            // remove the trailing slash and redirect
            return existingPath.slice(0, -1);
          }
          return undefined; // Return a falsy value: no redirect created
        },
      },
    ]
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      ({
        docs: {
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: ({versionDocsDirPath, docPath}) =>
              `https://github.com/OmniTrustILM/documentation/edit/documentation/${versionDocsDirPath}/${docPath}`,
          remarkPlugins: [
            [
              remarkFindReplacePlugin,
              {
                // List your find and replace values. Both values must be strings.
                // This is required.
                replacements: {
                  API_BASE_URL: 'https://docs.otilm.com/api/',
                },
                // By default, find values are prefixed to reduce the chances of
                // conflicting with real content. You can change the prefix here.
                // Set to `false` to disable the prefix.
                prefix: '%'
              },
            ],
            [
              remarkSimplePlantumlPlugin,
              {
                baseUrl: "https://www.plantuml.com/plantuml/svg",
                type: "svg"
              }
            ],
          ],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
    [
      'redocusaurus',
      {
        specs: [
          {
            id: 'core-acme',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-acme.yaml',
            route: '/api/core-acme/',
          },
          {
            id: 'core-approval',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-approval.yaml',
            route: '/api/core-approval/',
          },
          {
            id: 'core-auth',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-auth.yaml',
            route: '/api/core-auth/',
          },
          {
            id: 'core-authority',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-authority.yaml',
            route: '/api/core-authority/',
          },
          {
            id: 'core-certificate',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-certificate.yaml',
            route: '/api/core-certificate/',
          },
          {
            id: 'core-client-operations',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-client-operations.yaml',
            route: '/api/core-client-operations/',
          },
          {
            id: 'core-cmp',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-cmp.yaml',
            route: '/api/core-cmp/',
          },
          {
            id: 'core-compliance-profile',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-compliance-profile.yaml',
            route: '/api/core-compliance-profile/',
          },
          {
            id: 'core-compliance-v2',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-compliance-v2.yaml',
            route: '/api/core-compliance-v2/',
          },
          {
            id: 'core-connector',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-connector.yaml',
            route: '/api/core-connector/',
          },
          {
            id: 'core-credential',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-credential.yaml',
            route: '/api/core-credential/',
          },
          {
            id: 'core-cryptographic-operations',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-cryptographic-operations.yaml',
            route: '/api/core-cryptographic-operations/',
          },
          {
            id: 'core-attribute',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-attribute.yaml',
            route: '/api/core-attribute/',
          },
          {
            id: 'core-discovery',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-discovery.yaml',
            route: '/api/core-discovery/',
          },
          {
            id: 'core-entity',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-entity.yaml',
            route: '/api/core-entity/',
          },
          {
            id: 'core-group',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-group.yaml',
            route: '/api/core-group/',
          },
          {
            id: 'core-key',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-cryptographic-key.yaml',
            route: '/api/core-key/',
          },
          {
            id: 'core-local',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-local.yaml',
            route: '/api/core-local/',
          },
          {
            id: 'core-location',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-location.yaml',
            route: '/api/core-location/',
          },
          {
            id: 'core-notification',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-notification.yaml',
            route: '/api/core-notification/',
          },
          {
            id: 'core-other',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-other.yaml',
            route: '/api/core-other/',
          },
          {
            id: 'core-ra-profile',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-ra-profile.yaml',
            route: '/api/core-ra-profile/',
          },
          {
            id: 'core-scep',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-scep.yaml',
            route: '/api/core-scep/',
          },
          {
            id: 'core-scheduler',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-scheduler.yaml',
            route: '/api/core-scheduler/',
          },
          {
            id: 'core-secret',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-secret.yaml',
            route: '/api/core-secret/',
          },
          {
            id: 'core-token',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-token.yaml',
            route: '/api/core-token/',
          },
          {
            id: 'core-token-profile',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-token-profile.yaml',
            route: '/api/core-token-profile/',
          },
          {
            id: 'core-vault-profile',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-vault-profile.yaml',
            route: '/api/core-vault-profile/',
          },
          {
            id: 'core-vault',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-vault.yaml',
            route: '/api/core-vault/',
          },
          {
            id: 'core-workflows',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-core-workflows.yaml',
            route: '/api/core-workflows/',
          },


          {
            id: 'connector-authority-provider-legacy',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-connector-authority-provider-legacy.yaml',
            route: '/api/connector-authority-provider-legacy/',
          },
          {
            id: 'connector-authority-provider-v2',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-connector-authority-provider-v2.yaml',
            route: '/api/connector-authority-provider-v2/',
          },
          {
            id: 'connector-compliance-provider',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-connector-compliance-provider.yaml',
            route: '/api/connector-compliance-provider/',
          },
          {
            id: 'connector-compliance-provider-v2',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-connector-compliance-provider-v2.yaml',
            route: '/api/connector-compliance-provider-v2/',
          },
          {
            id: 'connector-credential-provider',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-connector-credential-provider.yaml',
            route: '/api/connector-credential-provider/',
          },
          {
            id: 'connector-cryptography-provider',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-connector-cryptography-provider.yaml',
            route: '/api/connector-cryptography-provider/',
          },
          {
            id: 'connector-discovery-provider',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-connector-discovery-provider.yaml',
            route: '/api/connector-discovery-provider/',
          },
          {
            id: 'connector-entity-provider',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-connector-entity-provider.yaml',
            route: '/api/connector-entity-provider/',
          },
          {
            id: 'connector-notification-provider',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-connector-notification-provider.yaml',
            route: '/api/connector-notification-provider/',
          },
          {
            id: 'connector-secret-provider',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-connector-secret-provider.yaml',
            route: '/api/connector-secret-provider/',
          },

          {
            id: 'protocol-acme',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-protocol-acme.yaml',
            route: '/api/protocol-acme/',
          },
          {
            id: 'protocol-cmp',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-protocol-cmp.yaml',
            route: '/api/protocol-cmp/',
          },
          {
            id: 'protocol-scep',
            spec: 'https://api.otilm.com/'+apiVersion+'/doc-openapi-protocol-scep.yaml',
            route: '/api/protocol-scep/',
          },
          {
            id: 'csc-component',
            spec: 'https://api.otilm.com/csc/'+cscVersion+'/csc-component.yaml',
            route: '/api/csc-component/',
          },
        ],
        theme: {
          /**
           * Highlight color for docs
           */
          primaryColor: '#0073CF',
          /**
           * Options to pass to redoc
           * @see https://github.com/redocly/redoc#redoc-options-object
           */
          redocOptions: { hideDownloadButton: false },
        },
      }
    ],
  ],

  themeConfig:
  /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
      ({
        docs: {
          sidebar: {
            hideable: true,
          },
        },
        navbar: {
          title: 'ILM Documentation',
          logo: {
            alt: 'ILM Logo',
            src: 'img/ot-sign-color.svg',
            srcDark: 'img/ot-sign-white.svg',
          },
          items: [
            // {
            //   type: 'doc',
            //   docId: 'intro',
            //   position: 'left',
            //   label: 'Tutorial',
            // },
            // {to: '/blog', label: 'Blog', position: 'left'},
            {
              label: 'Docs',
              position: 'left',
              to: '/docs',
            },
            {
              label: 'Core API',
              position: 'left',
              items: [
                {
                  label: 'ACME',
                  to: '/api/core-acme/',
                },
                {
                  label: 'Approval',
                  to: '/api/core-approval/',
                },
                {
                  label: 'Attribute',
                  to: '/api/core-attribute/',
                },
                {
                  label: 'Auth',
                  to: '/api/core-auth/',
                },
                {
                  label: 'Authority',
                  to: '/api/core-authority/',
                },
                {
                  label: 'Certificate',
                  to: '/api/core-certificate/',
                },
                {
                  label: 'Client Operations',
                  to: '/api/core-client-operations/',
                },
                {
                  label: 'CMP',
                  to: '/api/core-cmp/',
                },
                {
                  label: 'Compliance Profile',
                  to: '/api/core-compliance-profile/',
                },
                {
                  label: 'Compliance v2',
                  to: '/api/core-compliance-v2/',
                },
                {
                  label: 'Connector',
                  to: '/api/core-connector/',
                },
                {
                  label: 'Credential',
                  to: '/api/core-credential/',
                },
                {
                  label: 'Cryptographic Operations',
                  to: '/api/core-cryptographic-operations/',
                },
                {
                  label: 'Discovery',
                  to: '/api/core-discovery/',
                },
                {
                  label: 'Entity',
                  to: '/api/core-entity/',
                },
                {
                  label: 'Group',
                  to: '/api/core-group/',
                },
                {
                  label: 'Key',
                  to: '/api/core-key/',
                },
                {
                  label: 'Local',
                  to: '/api/core-local/',
                },
                {
                  label: 'Location',
                  to: '/api/core-location/',
                },
                {
                  label: 'Notification',
                  to: '/api/core-notification/',
                },
                {
                  label: 'Other',
                  to: '/api/core-other/',
                },
                {
                  label: 'RA Profile',
                  to: '/api/core-ra-profile/',
                },
                {
                  label: 'SCEP',
                  to: '/api/core-scep/',
                },
                {
                  label: 'Scheduler',
                  to: '/api/core-scheduler/',
                },
                {
                  label: 'Secret',
                  to: '/api/core-secret/',
                },
                {
                  label: 'Token',
                  to: '/api/core-token/',
                },
                {
                  label: 'Token Profile',
                  to: '/api/core-token-profile/',
                },
                {
                  label: 'Vault',
                  to: '/api/core-vault/',
                },
                {
                  label: 'Vault Profile',
                  to: '/api/core-vault-profile/',
                },
                {
                  label: 'Workflows',
                  to: '/api/core-workflows/',
                },
              ],
            },
            {
              label: 'Connector API',
              position: 'left',
              items: [
                {
                  label: 'Authority Provider Legacy',
                  to: '/api/connector-authority-provider-legacy/',
                },
                {
                  label: 'Authority Provider v2',
                  to: '/api/connector-authority-provider-v2/',
                },
                {
                  label: 'Compliance Provider',
                  to: '/api/connector-compliance-provider/',
                },
                {
                  label: 'Compliance Provider v2',
                  to: '/api/connector-compliance-provider-v2/',
                },
                {
                  label: 'Credential Provider',
                  to: '/api/connector-credential-provider/',
                },
                {
                  label: 'Cryptography Provider',
                  to: '/api/connector-cryptography-provider/',
                },
                {
                  label: 'Discovery Provider',
                  to: '/api/connector-discovery-provider/',
                },
                {
                  label: 'Entity Provider',
                  to: '/api/connector-entity-provider/',
                },
                {
                  label: 'Notification Provider',
                  to: '/api/connector-notification-provider/',
                },
                {
                  label: 'Secret Provider',
                  to: '/api/connector-secret-provider/',
                },
              ],
            },
            {
              label: 'Protocol API',
              position: 'left',
              items: [
                {
                  label: 'ACME',
                  to: '/api/protocol-acme/',
                },
                {
                  label: 'CMP',
                  to: '/api/protocol-cmp/',
                },
                {
                  label: 'SCEP',
                  to: '/api/protocol-scep/',
                },
              ],
            },
            {
              label: 'CSC API',
              position: 'left',
              to: '/api/csc-component/',
            },
            {
              href: 'https://github.com/OmniTrustILM/ilm/discussions',
              className: 'pseudo-icon github-icon',
              position: 'right',
            },
            {
              href: 'https://discord.gg/XYsSZKjSt4',
              className: 'pseudo-icon discord-icon',
              position: 'right',
            },
            {
              href: 'https://securedbyintegrity.com/platform/identity-lifecycle-management-ilm/',
              label: 'About ILM',
              position: 'right',
            },
          ],
        },
        footer: {
          style: 'dark',
          // links: [
          //   {
          //     title: 'Docs',
          //     items: [
          //       {
          //         label: 'Tutorial',
          //         to: '/docs/intro',
          //       },
          //     ],
          //   },
          //   {
          //     title: 'Community',
          //     items: [
          //       {
          //         label: 'Stack Overflow',
          //         href: 'https://stackoverflow.com/questions/tagged/docusaurus',
          //       },
          //       {
          //         label: 'Discord',
          //         href: 'https://discordapp.com/invite/docusaurus',
          //       },
          //       {
          //         label: 'Twitter',
          //         href: 'https://twitter.com/docusaurus',
          //       },
          //     ],
          //   },
          //   {
          //     title: 'More',
          //     items: [
          //       {
          //         label: 'Blog',
          //         to: '/blog',
          //       },
          //       {
          //         label: 'GitHub',
          //         href: 'https://github.com/facebook/docusaurus',
          //       },
          //     ],
          //   },
          // ],
          copyright: `Copyright © 2018 - ${new Date().getFullYear()} Identity Lifecycle Management Built with Docusaurus`,
        },
        prism: {
          theme: lightCodeTheme,
          darkTheme: darkCodeTheme,
          additionalLanguages: ['powershell','java','hcl','scala','bash'],
        },
        algolia: {
          // The application ID provided by Algolia
          appId: '9LVBEQBLSX',
          // Public API key: it is safe to commit it
          apiKey: 'e5c6094c457339acfcd8114bef0f509a',
          indexName: 'czertainly',
          // Optional: see doc section below
          contextualSearch: true,
        },
      }),
};

export default config;
