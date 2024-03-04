#!/usr/bin/env bash

rg --files | fzf --reverse -m \
    --preview 'bat --style plain,changes,header --color=always {}' \
    --preview-window '~3' \
    --bind ctrl-j:preview-down,ctrl-k:preview-up \
    --bind "ctrl-a:select-all" \
    --bind "ctrl-v:execute(echo {} vsplit)+abort" \
    --bind ctrl-d:preview-page-down,ctrl-u:preview-page-up
