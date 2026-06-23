# CZERTAINLY Documentation

> This repository is part of the open source project CZERTAINLY. You can find more information about the project at [CZERTAINLY](https://github.com/OmniTrustILM/ilm) repository, including the contribution guide.

CZERTAINLY documentation is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## How to contribute

The contribution is easy, fork the repository and make a pull request with your changes.
For the contribution guide to the CZERTAINLY, refer to [CZERTAINLY](https://github.com/OmniTrustILM/ilm) repository.

To learn how to work with Docusaurus, refer to the [Docusaurus documentation](https://docusaurus.io/docs/).

> [!IMPORTANT]  
> Check the [Docusaurus requirements](https://docusaurus.io/docs/installation#requirements) when you are setting up your environment for the first time and would like to run the documentation locally.

> [!NOTE]  
> Installation of the prerequisites may differ based on your operating system. Check the instruction for your operating system before you start the installation.

## How to work with the documentation

- Use `yarn install` for installation of the documentation modules and dependencies.
- Use `yarn start` to start a local development server providing a rendered version of your local copy of the documentation. It will be typically available on http://localhost:3000/ and browser window should automatically open up for you.
- Use `yarn build` for building the documentation. This command generates static content into the `build` directory.

> [!NOTE]  
> You can use `npm` instead of `yarn` for the same purpose. The `yarn` is a package manager that doubles as project manager. It is a good alternative to `npm` and it is recommended to use it for the development of the CZERTAINLY documentation.

## How to deploy the documentation

The CZERTAINLY documentation is deployed to the GitHub pages. The deployment is done automatically by the GitHub Actions when the changes are merged to the `gh-pages` branch.
