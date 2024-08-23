# .bashrc

# Source global definitions
if [ -f /etc/bashrc ]; then
	. /etc/bashrc
fi

# Uncomment the following line if you don't like systemctl's auto-paging feature:
# export SYSTEMD_PAGER=

module load mpi


# User specific aliases and functions

export CLICOLOR=1
export PS1='\[\033[01;34m\] \w/\[\033[00;34m\]\[\033[01;32m\]> \[\033[00m\]'

alias c="clear"
alias l="ls -lhAF"
alias lt="ls -lhAtr"
alias ll="ls -lhF"
alias diff=colordiff


# Set some variables for local software 
export SPACK_DIR=$HOME/Software/spack
export BOOST_DIR=$HOME/Software/boost_1_69_0
export JULIA_DIR=$HOME/Software/julia-1.1.0
export BRAID_DIR=$HOME/Numerics/xbraid/braid
export MELD_DIR=$HOME/Software/meld-3.20.1/bin
export PETSC_DIR=$HOME/Software/petsc
export PETSC_ARCH=linux-gnu-c-debug
export PARADAE_DIR=$HOME/Numerics/paradae
export SUITESPARSE_DIR=$HOME/Software/SuiteSparse

# Add to PATH variable
export PATH=$HOME/bin:$BRAID_DIR:$MELD_DIR/bin:$JULIA_DIR/bin:$SPACK_DIR:$PATH

# Add to LD_LIBRARY_PATH
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$PETSC_DIR/$PETSC_ARCH/lib:$BRAID_DIR:$BOOST_DIR/stage/lib:$PARADAE_DIR/lib:$SUITESPARSE_DIR/lib

# Spack: set environment variables and load packages
#. $SPACK_DIR/share/spack/setup-env.sh
#spack load fish
#spack load tig




## Spack
#. $SPACK_DIR/share/spack/setup-env.sh
#
#spack load fish
#spack load tig
#spack load gcc
#spack load cmake


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

