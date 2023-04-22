# Containerizing the application

## Create container image locally

From the project root context run the following command

```bash
docker build -t meteor-template-local -f docker/zcloud.dockerfile .
```

### [Dockerfile](docker/zcloud.dockerfile)

This dockerfile uses `zcloudws/meteor-build:2.11.0` to build the app and uses `zcloudws/meteor-node-mongodb-runtime` to
run app with NodeJS and MongoDB extracted from Meteor dev tools.

## Running container with created image

From the project root context run the following command

```bash
docker run --rm -p 3000:3000 -p 27017:27017 --name meteor-template \
  --env USE_INTERNAL_MONGODB=true \
  --env MONGODB_PORT=27017 \
  --env MONGODB_DATA_DIR=/mongodb-data \
  --env MONGO_URL=mongodb://localhost:27017/app \
  --env ROOT_URL=http://localhost:3000 \
  meteor-template-local
```

## Deploying this application on [zcloud.ws](zcloud.ws)

After create an environment for application

- Connect your environment with Github to build when push on `Push to deploy` tab.
  - On input `Dockerfile for build` use `docker/zcloud.dockerfile`
- Configure port number and check `Use SSL` on `Service` tab
- Create the following environment variables on `Env. Vars` tab
  - ROOT_URL: uses URL from the basic info tab;
  - USE_INTERNAL_MONGODB: `true`
- Configure zCPU, memory and Replica count resources on `Advanced` tab

After configure options on [zcloud](https://app.zcloud.ws) commit and push to start deploy

# [Live demo](https://meteor-template-sample-quave.svc.zcloud.ws/) from this project 
