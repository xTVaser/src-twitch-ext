# Twitch Extensions Boilerplate

The Twitch Extensions Boilerplate acts as a simple starting point to create your Extension, as well as a simple method using Docker to locally serve your Extension for testing and development.

## Dependencies

You will need:
 * [docker](https://docs.docker.com/engine/installation/)
 * [docker-compose](https://docs.docker.com/compose/install/)

## Generate self-signed certs
```bash
cd certs
./generate_local_ssl.sh
    # Requires a sudo password so that the cert can be installed on the root keychain
    # If this install fails, see the README in ./certs for manual override.
```

## To start the Extensions Boilerplate service
```bash
docker-compose up --build
```

## Further documentation

Please consult the [Twitch Extensions documentation on the Twitch developer site](https://dev.twitch.tv/docs/extensions)