FROM zcloudws/meteor-build:3.0.3 as builder

WORKDIR /build/source
USER root

RUN chown zcloud:zcloud -R /build

USER zcloud
COPY --chown=zcloud:zcloud . /build/source

ENV METEOR_DISABLE_OPTIMISTIC_CACHING=1

#  --legacy-peer-deps because of react-error-boundary
RUN meteor npm i --no-audit --legacy-peer-deps && meteor build --platforms web.browser,web.cordova --directory ../app-build

FROM zcloudws/meteor-node-mongodb-runtime:3.0.3-with-tools

COPY --from=builder /build/app-build/bundle /home/zcloud/app

#  --legacy-peer-deps because of react-error-boundary
RUN cd /home/zcloud/app/programs/server && npm i  --no-audit --legacy-peer-deps

WORKDIR /home/zcloud/app

ENTRYPOINT ["/scripts/startup.sh"]
