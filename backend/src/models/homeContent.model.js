import mongoose from "mongoose";

const homeContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "home-page",
      unique: true,
      index: true,
    },
    marqueeItems: {
      type: [String],
      default: [
        '✦ Free Shipping above ₹999',
        '✦ Custom Jewellery',
        '✦ Free Gifts on all Orders',
      ],
    },
    heroContent: {
      women: {
        image: { type: String, default: "/island-girl.jpg" },
        imagePublicId: { type: String, default: "" },
      },
      men: {
        image: { type: String, default: "/trial.png" },
        imagePublicId: { type: String, default: "" },
      },
      kids: {
        image: { type: String, default: "/trial.png" },
        imagePublicId: { type: String, default: "" },
      },
    },
    promoBanners: [
      {
        tag: { type: String },
        headline: { type: String },
        cta: { type: String },
        link: { type: String },
        image: { type: String },
        imagePublicId: { type: String },
        textSide: { type: String, enum: ['left', 'right'], default: 'right' }
      }
    ]
  },
  {
    timestamps: true,
  }
);

const HomeContent = mongoose.model("HomeContent", homeContentSchema);

export default HomeContent;
