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
export TAPENADE_HOME="/home/sguenther/Software/tapenade3.6"
export F77=gfortran

export SU2_RUN="/home/sguenther/Numerics/SU2/bin"
export SU2_HOME="/home/sguenther/Numerics/SU2"
export PATH=$PATH:$SU2_RUN
export PYTHONPATH=$PYTHONPATH:$SU2_RUN


alias c="clear"
alias l="ls -lhAF"
alias ll="ls -lhF"
alias diff=colordiff
alias tapenade="/home/sguenther/Software/tapenade3.6/bin/tapenade"
alias tecplot="/usr/local/tecplot360ex/bin/tec360"
alias terminal="gnome-terminal"
alias sublime3="/home/sguenther/Software/sublime_text_3/sublime_text"
alias gitkraken="/opt/GitKraken/gitkraken/gitkraken"

# Git 

alias gitpp="git log --graph --simplify-by-decoration --pretty=format:'%d' --all"
# Go forward in Git commit hierarchy towards a particular commit
# Usage: 
#  > gitgofwd master
gitgofwd() {
   git checkout $(git rev-list --topo-order HEAD.."$*" | tail -1)
}
# Go back in Git commit hierarchy
alias gitgoback="git checkout HEAD~"



# Compile on SciComp Server
export ICECC_VERSION=~/Software/gcc7.3.1.tar.gz
export ICECC_CARET_WORKAROUND=0
export PATH=/usr/libexec/icecc/bin:$PATH

