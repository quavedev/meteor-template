FROM zcloudws/meteor-build:3.5.4 AS builder

WORKDIR /app-source/source
USER root

RUN chown zcloud:zcloud -R /app-source

USER zcloud
COPY --chown=zcloud:zcloud . /app-source/source

ENV METEOR_DISABLE_OPTIMISTIC_CACHING=1
# Work around @parcel/watcher EINTR hangs during Docker builds with Meteor/Rspack.
ENV METEOR_WATCH_FORCE_POLLING=true

#  --legacy-peer-deps because of react-error-boundary
RUN meteor npm i --no-audit --legacy-peer-deps && meteor build --platforms web.browser,web.cordova --directory ../app-build

FROM zcloudws/meteor-node-mongodb-runtime:3.5.4-with-tools

COPY --from=builder /app-source/app-build/bundle /home/zcloud/app

#  --legacy-peer-deps because of react-error-boundary
RUN cd /home/zcloud/app/programs/server && chmod +rw npm-shrinkwrap.json && npm i --no-audit --legacy-peer-deps

WORKDIR /home/zcloud/app

ENTRYPOINT ["/scripts/startup.sh"]
