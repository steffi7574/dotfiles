"general configuration
set expandtab
set tabstop=4
set shiftwidth=4

" turn syntax highlighting on
syntax on
colorscheme atomdark
set background=dark


" turn on relative line numbering
set number
set relativenumber
" highlight matching braces
set showmatch
"do not show mode (INSERT VISUAL etc) in last line
set noshowmode

""GUI
set title                       " show file name in title bar
set guioptions-=T               " don't show toolbar
set guioptions-=m               " don't show menubar
set guioptions-=l               " remove scrollbars
set guioptions-=r
set guioptions-=R
set guioptions-=L
set linespace=0                                 " no extra space between lines (!)


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

"min lines above or below cursor
set scrolloff=3

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

""Control
set autoread    "vim loads modified file after external changes

"" Colors for vimdiff
"highlight DiffAdd cterm=NONE ctermfg=white ctermbg=Green gui=NONE guifg=white guibg=Green
"highlight DiffDelete cterm=NONE ctermfg=white ctermbg=Red gui=NONE guifg=white guibg=Red
"highlight DiffChange cterm=NONE ctermfg=white ctermbg=Yellow gui=NONE guifg=white guibg=Yellow
"highlight DiffText cterm=NONE ctermfg=white ctermbg=Magenta gui=NONE guifg=white guibg=Magenta

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
    "colorscheme desert
    "syntax off
    set diffopt+=iwhite
endif


" load plugins
" curl -fLo ~/.vim/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
call plug#begin('~/.vim/plugged')
  Plug 'tpope/vim-fugitive'
  Plug 'vim-airline/vim-airline'
  Plug 'vim-airline/vim-airline-themes'
  Plug 'scrooloose/nerdtree'
call plug#end()

let mapleader=","

""AIRLINE
set laststatus=2
let g:airline#extensions#syntastic#enabled=1
let g:airline_extensions=['tabline', 'branch']
let g:airline_theme='sol'
"Enable the list of buffers
let g:airline#extensions#tabline#enabled = 1
"Show just the filename
let g:airline#extensions#tabline#fnamemod = ':t'
"airline font
let g:airline_powerline_fonts = 1

""NERDTREE
map <leader>nn :NERDTreeToggle<cr>
map <leader>nf :NERDTreeFind<cr>
let NERDTreeWinSize = 30


" Close all open buffers on entering a window if the only
" buffer that's left is the NERDTree buffer
" Source: https://github.com/scrooloose/nerdtree/issues/21
function! s:CloseIfOnlyNerdTreeLeft()
  if exists("t:NERDTreeBufName")
    if bufwinnr(t:NERDTreeBufName) != -1
      if winnr("$") == 1
        q
      endif
    endif
  endif
endfunction

" Close NERDTree if it is the last buffer open
autocmd WinEnter * call s:CloseIfOnlyNerdTreeLeft()


"Tab configuration
map <leader>tn :tabnew<cr>
map <leader>te :tabedit
map <leader>tc :tabclose
map <leader>tm :tabmove


"Enable filetype plugin -> load filetype specific scripts stored in
"~/.vim/ftpugin/<filetype>.vim
filetype plugin on 
