import {
  AggregateOptions,
  CreateOptions,
  DeleteResult,
  QueryFilter,
  FlattenMaps,
  HydratedDocument,
  Model,
  PipelineStage,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateResult,
} from "mongoose";

export default abstract class DBRepository<T> {
  constructor(protected readonly model: Model<T>) {}
  findOne = async ({
    filter,
    projection,
    options,
  }: {
    filter: QueryFilter<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }): Promise<HydratedDocument<T> | null> => {
    return await this.model.findOne(filter, projection, options);
  };

  findOneAndUpdate = async ({
    filter,
    data,
    options,
  }: {
    filter: QueryFilter<T>;
    data: UpdateQuery<T>;
    options?: QueryOptions<T>;
  }): Promise<HydratedDocument<T> | null> => {
    return await this.model.findOneAndUpdate(filter, data, options);
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
    filter: QueryFilter<T>;
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
  }): Promise<HydratedDocument<T>[]> => {
    return (await this.model.create(
      data as any,
      options,
    )) as unknown as HydratedDocument<T>[];
  };

  updateMany = async ({
    filter,
    options,
    data,
  }: {
    filter: QueryFilter<T>;
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
    filter: QueryFilter<T>;
    options?: Record<string, any>;
    data: UpdateQuery<HydratedDocument<T>>;
  }): Promise<UpdateResult> => {
    return await this.model.updateOne(filter, data, options);
  };

  deleteOne = async ({
    filter,
    options,
  }: {
    filter: QueryFilter<T>;
    options?: Record<string, any>;
  }): Promise<DeleteResult> => {
    return await this.model.deleteOne(filter, options);
  };

  deleteMany = async ({
    filter,
    options,
  }: {
    filter: QueryFilter<T>;
    options?: Record<string, any>;
  }): Promise<DeleteResult> => {
    return await this.model.deleteMany(filter, options);
  };

  aggregate = ({
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
