# vscode-florencio-tools

VSCode extension with some behaviours I was missing from neovim.

## Features

- Auto close sidebar when there are editors open side by side
- Telescope: Find files
- Telescope: Find in files
- Lazygit
- Jump to editor diagnostics faster
- Improved peek experience by removing selection on the opened editor
- fx command to navigate a json file
- Doesn't let vscode close the last editor, opens `vsnetrw` to navigate the fs and allow vim commands
- Auto expand editor width with more than 3 vsplits

## Requirements

- fzf, rg, bat, lazygit

## How to publish

- `npm install -g @vscode/vsce`
- `vsce login florencio` ([Personal Access Token](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token) needed)
- bump `package.json` version
- `vsce publish`
