import { ShatterContext } from '@shattercms/types';
import { RebuildConfig } from '../index';
import { createConnection } from 'net';
import {
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';

let builds: Rebuild[] = [];
let isBuilding = false;

@ObjectType()
class Rebuild {
  @Field()
  status: 'pending' | 'complete' | 'failed';
  @Field({ nullable: true })
  stage?: string;
  @Field()
  startedAt: string;
  @Field({ nullable: true })
  completedAt?: string;
}

@Resolver()
export class RebuildResolver {
  @Mutation(() => Rebuild)
  rebuild_create(@Ctx() context: ShatterContext) {
    const options = context.config.rebuild as RebuildConfig;

    if (isBuilding) {
      throw new Error('Build already in progress');
    }

    // Create new build
    const newBuild: Rebuild = {
      startedAt: new Date().toISOString(),
      status: 'pending',
    };

    // Save up to x builds in memory
    builds.unshift(newBuild);
    if (builds.length > options.saveLimit) {
      builds.pop();
    }
    isBuilding = true;

    // Send rebuild command
    const client = createConnection(options.socketPath);
    client.on('error', onError);
    client.on('data', onData);
    client.on('close', onClose);
    client.on('connect', () => {
      client.write('rebuild');
    });

    return newBuild;
  }

  @Query(() => [Rebuild])
  rebuild_getAll() {
    return builds;
  }

  @Query(() => Rebuild, { nullable: true })
  rebuild_get() {
    return isBuilding ? builds[0] : null;
  }
}

const onError = (error: Error) => {
  if (isBuilding) {
    console.log(error);
    builds[0].status = 'failed';
    builds[0].completedAt = new Date().toISOString();
    isBuilding = false;
  } else {
    throw error;
  }
};

const onData = (data: Buffer) => {
  if (isBuilding) {
    builds[0].stage = data.toString();
  }
};

const onClose = () => {
  if (isBuilding) {
    builds[0].status = 'complete';
    builds[0].completedAt = new Date().toISOString();
    isBuilding = false;
  }
};
