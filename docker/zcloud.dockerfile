# Build stage
FROM zcloudws/meteor-build:2.11.0 as builder

USER root

RUN mkdir -p /build/source && chown zcloud:zcloud -R /build

USER zcloud

COPY --chown=zcloud:zcloud . /build/source

RUN cd /build/source && \
    meteor npm install && \
    meteor build --directory ../app-build

# Clean image with builded app
FROM zcloudws/meteor-node-mongodb-runtime:2.11.0

COPY --from=builder /build/app-build/bundle /home/zcloud/app

RUN cd /home/zcloud/app/programs/server && npm install

WORKDIR /home/zcloud/app

# Entrypoint from image
ENTRYPOINT ["/scripts/startup.sh"]
