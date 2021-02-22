import { Module } from '@shattercms/types';

import { RebuildResolver } from './resolvers/build';
export { RebuildResolver } from './resolvers/build';

export interface RebuildConfig {
  socketPath: string;
  saveLimit: number;
}
const defaultConfig: RebuildConfig = {
  socketPath: '/var/run/dokku-rebuild/dokku-rebuild.sock',
  saveLimit: 10,
};

const apiModule: Module<RebuildConfig> = (context, moduleOptions) => {
  // Set option defaults
  context.config.rebuild = Object.assign(
    {},
    defaultConfig,
    context.config.rebuild,
    moduleOptions
  );

  context.resolvers.push(RebuildResolver);
};
export default apiModule;
