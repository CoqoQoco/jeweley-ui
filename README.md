# Docker & nginx deployment

# https://cli.vuejs.org/guide/deployment.html#docker-nginx

docker build . -t jewelry-ui

docker run -d -p 8080:80 jewelry-ui

# curl localhost:8080
