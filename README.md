# ShatterCMS Rebuild

ShatterCMS submodule for rebuilding [Dokku](https://github.com/dokku/dokku) apps using [dokku-rebuild](https://github.com/shattercms/dokku-rebuild).

## Requirements

This module is meant for use with Dokku. If you don't manage your apps through Dokku this module is not for you.

- A Dokku app you want to trigger a rebuild on
- The dokku-rebuild service set up and running

## Setup

1. Add `@shattercms/rebuild` as dependency to your project

```bash
# install with npm
npm install @shattercms/rebuild

# or use yarn instead
yarn add @shattercms/rebuild
```

2. Add the module to the `shatter.js` config file

```js
module.exports = {
  modules: ['@shattercms/rebuild'],

  // (defaults)
  rebuild {
    socketPath: '/var/run/dokku-rebuild/dokku-rebuild.sock',
    saveLimit: 10,
  },
}
```

## Options

### `socketPath`

If you configured dokku-rebuild to use a different socket path, you can tell the rebuild module to use that same path by using the `socketPath` option.

### `saveLimit`

If you want to store more than 10 builds you can do so by changing the `saveLimit` option.

## Usage

**This module does not interface with the database. Current and past builds are only saved in memory. If you restart the API, this data will be lost!**

### GraphQL

```grapql
type Rebuild {
  # 'pending' | 'complete' | 'failed'
  status: String!

  # Current stage from dokku-rebuild
  stage?: String

  # ISO time strings
  startedAt: String!
  completedAt?: String
}

query {
  # Get all builds
  # () => [Rebuild]
  rebuild_getAll {
    ...Rebuild
  }

  # Get current build
  # () => Rebuild | null
  rebuild_get {
    ...Rebuild
  }
}

mutation {
  # Trigger a new rebuild
  # () => Rebuild
  rebuild_create {
    ...Rebuild
  }
}
```

## Troubleshooting

- Make sure the `socketPath` is mounted to your app.
- Check if the dokku-rebuild service is indeed running (`systemctl status dokku-rebuild`), or check the logs for more info (`journalctl -u dokku-rebuild`)
- Try reinstalling the dokku-rebuild service to correct folder and file permissions
