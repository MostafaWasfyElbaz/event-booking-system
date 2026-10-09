import {
  CreateOptions,
  DeleteResult,
  FilterQuery,
  FlattenMaps,
  HydratedDocument,
  Model,
  PipelineStage,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateResult,
} from "mongoose";
import { AggregateOptions } from "node:sqlite";

export default abstract class DBRepository<T> {
  constructor(protected readonly model: Model<T>) {}
  findOne = async ({
    filter,
    projection,
    options,
  }: {
    filter: FilterQuery<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }): Promise<HydratedDocument<T> | null> => {
    return await this.model.findOne(filter, projection, options);
  };

  findById = async ({
    id,
    projection,
    options,
  }: {
    id: string;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }): Promise<HydratedDocument<T> | null> => {
    return await this.model.findById(id, projection, options);
  };

  find = async ({
    filter,
    projection,
    options,
  }: {
    filter: FilterQuery<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }): Promise<HydratedDocument<T>[] | []> => {
    return await this.model.find(filter, projection, options);
  };

  create = async ({
    data,
    options,
  }: {
    data: Partial<T>[];
    options?: CreateOptions;
  }): Promise<T[]> => {
    return await this.model.create(data, options);
  };

  updateMany = async ({
    filter,
    options,
    data,
  }: {
    filter: FilterQuery<T>;
    options?: Record<string, any>;
    data: UpdateQuery<HydratedDocument<T>>;
  }): Promise<UpdateResult> => {
    return await this.model.updateMany(filter, data, options);
  };

  updateOne = async ({
    filter,
    options,
    data,
  }: {
    filter: FilterQuery<T>;
    options?: Record<string, any>;
    data: UpdateQuery<HydratedDocument<T>>;
  }): Promise<UpdateResult> => {
    return await this.model.updateOne(filter, data, options);
  };

  deleteOne = async ({
    filter,
    options,
  }: {
    filter: FilterQuery<T>;
    options?: Record<string, any>;
  }): Promise<DeleteResult> => {
    return await this.model.deleteOne(filter, options);
  };

  deleteMany = async ({
    filter,
    options,
  }: {
    filter: FilterQuery<T>;
    options?: Record<string, any>;
  }): Promise<DeleteResult> => {
    return await this.model.deleteMany(filter, options);
  };

  aggregate =  ({
    pipeline,
    options,
  }: {
    pipeline: PipelineStage[];
    options?: AggregateOptions;
  }) => {
    const doc = this.model.aggregate(pipeline, options);
    return doc;
  };
}
