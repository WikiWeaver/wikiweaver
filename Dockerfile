FROM golang:latest AS builder

# Builder image only
RUN apt-get update && \
  apt-get install -y \
  make \
  ca-certificates \
  openssl

# Add certificates needed to download go dependencies, taken from:
# https://stackoverflow.com/questions/64462922/docker-multi-stage-build-go-image-x509-certificate-signed-by-unknown-authorit
ARG cert_location=/usr/local/share/ca-certificates
RUN openssl s_client -showcerts -connect github.com:443 </dev/null 2>/dev/null|openssl x509 -outform PEM > ${cert_location}/github.crt
RUN openssl s_client -showcerts -connect proxy.golang.org:443 </dev/null 2>/dev/null|openssl x509 -outform PEM >  ${cert_location}/proxy.golang.crt
RUN update-ca-certificates

COPY wikiweaver-server /wikiweaver-server
WORKDIR /wikiweaver-server

ENV GOCACHE=/root/.cache/go-build
RUN --mount=type=cache,target=/go/pkg/mod \
  --mount=type=cache,target="/root/.cache/go-build" \
  make build

FROM nginx:latest

# Final image
RUN apt-get update && \
  apt-get install -y \
  tini

COPY wikiweaver-web /usr/share/nginx/html/
COPY docker-nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /wikiweaver-server /wikiweaver-server

EXPOSE 80

WORKDIR /
COPY docker-entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/usr/bin/tini", "-g", "--", "/entrypoint.sh"]

