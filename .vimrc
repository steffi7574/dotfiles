"general configuration
set expandtab
set tabstop=2
set shiftwidth=2

" turn syntax highlighting on
syntax on
"colorscheme bandit
colorscheme default

" turn line numbers on
set number
" highlight matching braces
set showmatch

" set UTF-8 encoding
set enc=utf-8
set fenc=utf-8
set termencoding=utf-8
" disable vi compatibility (emulation of old bugs)
set nocompatible
" use indentation of previous line
set autoindent
" use intelligent indentation for C
"set smartindent

" enable changes in hidden buffers
set hidden

" enable highlight of search pattern matches
set hlsearch
" Press Space to turn off highlighting and clear any message already displayed.
nnoremap <silent> <Space> :nohlsearch<Bar>:echo<CR>

" make searches case insensitive unless they contain at least one capital
" letter
set ignorecase
set smartcase

highlight DiffAdd cterm=NONE ctermfg=white ctermbg=Green gui=NONE guifg=white guibg=Green
highlight DiffDelete cterm=NONE ctermfg=white ctermbg=Red gui=NONE guifg=white guibg=Red
highlight DiffChange cterm=NONE ctermfg=white ctermbg=Yellow gui=NONE guifg=white guibg=Yellow
highlight DiffText cterm=NONE ctermfg=white ctermbg=Magenta gui=NONE guifg=white guibg=Magenta

" spell checking and automatic wrapping at 72 columns for git commit messages
autocmd Filetype gitcommit setlocal spell textwidth=72


" set paste toggle -> key enters/leaves paste mode 
set pastetoggle=<F10>


" copy and paste to/from system clipboard
vmap <C-c> :<Esc>`>a<CR><Esc>mx`<i<CR><Esc>my'xk$v'y!xclip -selection c<CR>u
map <Insert> :set paste<CR>i<CR><CR><Esc>k:.!xclip -o<CR>JxkJx:set nopaste<CR> 


" VIMDIFF
if &diff
    set wrap
    colorscheme desert
    set diffopt+=iwhite
endif

"show file name in title bar
set title

