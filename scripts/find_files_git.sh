#!/usr/bin/env bash

git diff --name-only | fzf --reverse -m \
    --preview 'bat --style plain,changes,header --color=always {}' \
    --preview-window '~3' \
    --bind="j:down" \
    --bind="k:up" \
    --bind="i:enable-search+unbind(j)+unbind(k)+unbind(i)" \
    --bind ctrl-j:preview-down,ctrl-k:preview-up \
    --bind "ctrl-a:select-all" \
    --bind ctrl-d:preview-page-down,ctrl-u:preview-page-up \
    --header '/ i (go to insert mode) /' \
