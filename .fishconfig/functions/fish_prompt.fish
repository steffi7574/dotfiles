function fish_prompt
	set -l __last_command_exit_status $status

    if not set -q -g __fish_robbyrussell_functions_defined
        set -g __fish_robbyrussell_functions_defined
        function _git_branch_name
            set -l branch (git symbolic-ref --quiet HEAD ^/dev/null)
            if set -q branch[1]
		#echo (git rev-parse --abbrev-ref HEAD)
                echo (string replace -r '^refs/heads/' '' $branch)
            else
                echo (git rev-parse --short HEAD ^/dev/null)
            end
        end

        function _is_git_dirty
            #echo (git status -s --ignore-submodules=dirty ^/dev/null)
            echo (git status -s -uno --ignore-submodules=dirty ^/dev/null)
        end

        function _is_git_repo
            type -q git
            or return 1
            git status -s >/dev/null ^/dev/null
        end

        function _hg_branch_name
            echo (hg branch ^/dev/null)
        end

        function _is_hg_dirty
            echo (hg status -mard ^/dev/null)
        end

        function _is_hg_repo
            type -q hg
            or return 1
            hg summary >/dev/null ^/dev/null
        end

        function _repo_branch_name
            eval "_$argv[1]_branch_name"
        end

        function _is_repo_dirty
            eval "_is_$argv[1]_dirty"
        end

        function _repo_type
            if _is_hg_repo
                echo 'hg'
            else if _is_git_repo
                echo 'git'
            end
        end
    end

    set -l cyan (set_color  cyan)
    set -l yellow (set_color yellow)
    set -l red (set_color red)
    set -l green (set_color green)
    set -l blue (set_color blue)
    set -l normal (set_color normal)

    set -l arrow_color "$green"
    if test $__last_command_exit_status != 0
        set arrow_color "$red"
    end

    set -l arrow "$arrow_color➜"
    if [ $USER = 'root' ]
        set arrow "$arrow_color#"
    end

    set -l cwd $cyan(basename (prompt_pwd))

    set -l repo_type (_repo_type)
    if [ $repo_type ]
        set -l repo_branch $red(_repo_branch_name $repo_type)
        #set repo_info "$blue ($repo_branch$blue)"
        set repo_info "$blue ($repo_branch"

        if [ (_is_repo_dirty $repo_type) ]
            set -l dirty "$yellow✗"
            set repo_info "$repo_info $dirty"
        end
        set repo_info "$repo_info$blue)"
    end

    #echo -n -s $arrow ' ' (set_color -o grey) (echo $PWD | sed -e "s|^$HOME|~|") $repo_info $normal ' '
    echo -n -s (set_color blue) (echo $PWD | sed -e "s|^$HOME|~|") '/' $repo_info (set_color green) '> ' $normal
end



