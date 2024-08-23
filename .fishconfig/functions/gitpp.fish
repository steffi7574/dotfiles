# Defined in - @ line 0
function gitpp --description alias\ gitpp=git\ log\ --graph\ --simplify-by-decoration\ --pretty=format:\'\%d\'\ --all
	git log --graph --simplify-by-decoration --pretty=format:'%d' --all $argv;
end
