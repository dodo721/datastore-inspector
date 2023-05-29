begin_watch () {
    tmux new-session -d -s webpack-webext "npm run $1"
    tmux split-window -h -t webpack-webext 'cd extension && web-ext run --firefox /snap/firefox/current/usr/lib/firefox/firefox'
    tmux -2 attach-session -t webpack-webext
}

# webpack --display-error-details --watch
if [[ $1 = 'prod' ]]; then
	echo "Compiling and watching with production optimisation"
    begin_watch compile-watch
else
	echo "Compiling and watching - dev/debug only"
	begin_watch compile-watch-fast
fi
