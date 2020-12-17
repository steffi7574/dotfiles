# Uncomment the following line if you don't like systemctl's auto-paging feature:
# export SYSTEMD_PAGER=

#module load mpi


# User specific aliases and functions

export CLICOLOR=1
export PS1='\h:\[\033[01;34m\] \w/\[\033[00;34m\]\[\033[01;32m\]> \[\033[00m\]'

# Set petsc directory
#export PETSC_DIR=$HOME/Software/petsc
export PETSC_DIR=$HOME/Software/petsc_optim
export PETSC_ARCH=arch-darwin-c-debug
#export SLEPC_DIR=/Users/guenther5/Software/slepc-3.13.3

# Torchbraid
export TORCHBRAID_DIR="$HOME/Numerics/torchbraid_master"
export PYTHONPATH="$TORCHBRAID_DIR:$TORCHBRAID_DIR/torchbraid"
export PYTHONPATH="/usr/local/anaconda3/lib/python3.7/site-packages":$PYTHONPATH
alias python="/usr/local/bin/python3.7"
export LD_LIBRARY_PATH=/usr/local/anaconda3/pkgs/intel-openmp-2019.4-233/lib/

export PATH="/usr/local/sbin:$PATH"
export PATH="/usr/local/anaconda3/bin:$PATH"

export LDFLAGS="-L/usr/local/opt/lapack/lib -L/usr/local/opt/openblas/lib -L/usr/local/opt/llvm/lib"
export CPPFLAGS="-I/usr/local/opt/lapack/include -I/usr/local/opt/openblas/include -I/usr/local/opt/llvm/include"

export TERM=xterm

alias c="clear"
alias l="ls -lhAF"
alias lt="ls -lhAtr"
alias ll="ls -lhF"
alias diff=colordiff

## Git 

# pretty git
alias gitpp="git log --graph --simplify-by-decoration --pretty=format:'%d' --all"
# Go forward in Git commit hierarchy towards a particular commit
# Usage: 
#  > gitgofwd master
gitgofwd() {
   git checkout $(git rev-list --topo-order HEAD.."$*" | tail -1)
}
# Go back in Git commit hierarchy
alias gitgoback="git checkout HEAD~"

#export $TERM=xterm
fish
