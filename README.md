# Script Kit v3

[https://scriptkit.com/](https://scriptkit.com/)

## Join the Discussion

[https://github.com/johnlindquist/kit/discussions](https://github.com/johnlindquist/kit/discussions)

## Docs

[https://github.com/johnlindquist/kit-docs](https://github.com/johnlindquist/kit-docs)

## ⭐️ Unlock Script Kit Pro by Sponsoring Script Kit ⭐️

❤️ [Sponsor me on GitHub](https://github.com/sponsors/johnlindquist/sponsorships?sponsor=johnlindquist&tier_id=235205) ❤️

### Sponsor Only Features

| Shipped | Planned |
| --- | --- |
| Built-in Debugger | Sync Scripts to GitHub Repo |
| Script Log Window | Run Script Remotely as GitHub Actions |
| Support through Discord | Advanced Widgets |
| | Screenshots |
| | Screen Recording |
| | Desktop Color Picker |
| | Measure Tool |
| | Debug from IDE |

## Script Kit Dev Setup

> Note: This ain't pretty 😅

Requirements: npm

### Clone Kit SDK

Clone:
`git clone https://github.com/johnlindquist/kit.git`

Install pnpm:

[https://pnpm.io/installation](https://pnpm.io/installation)

Install:
`pnpm install`

### (Skip if you already have a kenv from production) Clone the base kenv

Clone:
`git clone https://github.com/johnlindquist/kenv.git ~/.kenv`

### Building Kit SDK

`pnpm build-kit`

The build command builds the SDK to ~/.kit

#### npm link to app (First run only)

1. cd to ~/.kit
2. npm link
3. cd to wherever you cloned kitapp
4. npm link @johnlindquist/kit

This codebase is the core of Script Kit, a powerful tool designed to enhance productivity by allowing users to create, manage, and execute scripts efficiently. Script Kit provides a comprehensive SDK and a user-friendly application that integrates seamlessly with various development environments. It supports advanced features such as built-in debugging, script logging, and remote script execution. The platform is highly customizable, enabling users to extend its functionality with custom scripts and integrations. By leveraging Script Kit, developers can automate repetitive tasks, streamline workflows, and improve overall efficiency in their development processes.
