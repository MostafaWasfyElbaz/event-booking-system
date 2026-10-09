import { model, Schema } from "mongoose";
import { EventLocation, IEvent } from "../../common";
import { EventStatus } from "../../common/enums";

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [50, "Title cannot exceed 50 characters"],
      index:true
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      minlength: [3, "Category must be at least 3 characters"],
      maxlength: [50, "Category cannot exceed 50 characters"],
      index:true
    },

    locationType: {
      type: String,
      required: [true, "Location type is required"],
      enum: Object.values(EventLocation),
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      minlength: [3, "Location must be at least 3 characters"],
      maxlength: [100, "Location cannot exceed 100 characters"],
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      index:true
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },

    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      index:true
    },

    organizerId: {
      type: Schema.Types.ObjectId,
      required: [true, "Organizer ID is required"],
      ref: "User",
    },

    status: {
      type: String,
      required: [true, "Status is required"],
      enum: Object.values(EventStatus),
      index:true
    },
  },
  {
    timestamps: true,
  },
);

export const Event = model<IEvent>("Event", eventSchema);
