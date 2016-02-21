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

alias c="clear"
alias l="ls -lhAF"
alias ll="ls -lhF"
alias tapenade="/home/sguenther/Software/tapenade3.6/bin/tapenade"
alias tecplot="/usr/local/tecplot360ex/bin/tec360"
alias terminal="gnome-terminal"
alias sublime3="/home/sguenther/Software/sublime_text_3/sublime_text"

alias gitpp="git log --graph --simplify-by-decoration --pretty=format:'%d' --all"
#alias mpicc="mpicc -no-multibyte-chars"


