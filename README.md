# ILM Documentation

> This repository is part of the open source project ILM. You can find more information about the project at [ILM](https://github.com/OmniTrustILM/ilm) repository, including the contribution guide.

ILM documentation is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## How to contribute

The contribution is easy, fork the repository and make a pull request with your changes.
For the contribution guide to ILM, refer to [ILM](https://github.com/OmniTrustILM/ilm) repository.

To learn how to work with Docusaurus, refer to the [Docusaurus documentation](https://docusaurus.io/docs/).

> [!IMPORTANT]  
> Check the [Docusaurus requirements](https://docusaurus.io/docs/installation#requirements) when you are setting up your environment for the first time and would like to run the documentation locally.

> [!NOTE]  
> Installation of the prerequisites may differ based on your operating system. Check the instruction for your operating system before you start the installation.

## How to work with the documentation

- Use `yarn install` for installation of the documentation modules and dependencies.
- Use `yarn start` to start a local development server providing a rendered version of your local copy of the documentation. It will be typically available on http://localhost:3000/ and browser window should automatically open up for you.
- Use `yarn build` for building the documentation. This command generates static content into the `build` directory.

Use Node 24 and a running Docker daemon. A build renders source diagrams locally and downloads the pinned OpenAPI specifications. Keep the lockfile unchanged when installing an existing checkout with `yarn install --frozen-lockfile`.

Run `yarn typecheck` and `yarn coverage` before building, then `yarn verify-api-build` after the build. Coverage enforces an 80% minimum for Node and React code and produces separate LCOV reports for Sonar analysis.

Shared design tokens live in `src/css/tokens.css`. Homepage artwork, architecture diagrams and interactions are maintained as source code. PlantUML diagrams remain fenced blocks in documentation; generated SVGs are build outputs.

> [!NOTE]  
> You can use `npm` instead of `yarn` for the same purpose. The `yarn` is a package manager that doubles as project manager. It is a good alternative to `npm` and it is recommended to use it for the development of the ILM documentation.

## How to deploy the documentation

The documentation is deployed to GitHub Pages by the workflow on the `documentation` branch. Pull requests build and verify the site before deployment.
