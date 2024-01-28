#!/usr/bin/env bash

# received scripts folder path
CURRENT_FOLDER_PATH=$(dirname "$0")

rm -f /tmp/rg-fzf-{r,f}
RG_PREFIX="rg --column --line-number --no-heading --color=always --smart-case "
INITIAL_QUERY="${*:-}"
: | fzf -m --ansi --disabled --query "$INITIAL_QUERY" \
    --bind "start:reload($RG_PREFIX {q})+unbind(ctrl-r)" \
    --bind "change:reload:sleep 0.1; $RG_PREFIX {q} || true" \
    --bind "ctrl-f:unbind(change,ctrl-f)+change-prompt(2. fzf> )+enable-search+rebind(ctrl-r)+transform-query(echo {q} > /tmp/rg-fzf-r; cat /tmp/rg-fzf-f)" \
    --bind "ctrl-r:unbind(ctrl-r)+change-prompt(1. ripgrep> )+disable-search+reload($RG_PREFIX {q} || true)+rebind(change,ctrl-f)+transform-query(echo {q} > /tmp/rg-fzf-f; cat /tmp/rg-fzf-r)" \
    --bind "ctrl-j:preview-down,ctrl-k:preview-up" \
    --bind "ctrl-d:preview-page-down,ctrl-u:preview-page-up" \
    --bind "ctrl-a:select-all" \
    --color "hl:-1:underline,hl+:-1:underline:reverse" \
    --prompt '1. ripgrep> ' \
    --delimiter : \
    --header '/ CTRL-R (ripgrep mode) / CTRL-F (fzf mode) /' \
    --preview "$CURRENT_FOLDER_PATH/fzf-bat-preview-here.sh {1} {2}" \
    --preview-window '~3' \
    --reverse