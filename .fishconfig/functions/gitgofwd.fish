function gitgofwd
	echo git checkout (git rev-list --topo-order HEAD.."$argv" | tail -1)
end
