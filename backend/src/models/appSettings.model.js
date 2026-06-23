import mongoose from "mongoose";

const appSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    value: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const AppSettings = mongoose.model("AppSettings", appSettingsSchema);

export default AppSettings;

/**
 * Helper to get a setting by key, with a fallback default.
 */
export async function getSetting(key, defaultValue) {
  const doc = await AppSettings.findOne({ key });
  return doc ? doc.value : defaultValue;
}

/**
 * Helper to upsert a setting by key.
 */
export async function setSetting(key, value) {
  return AppSettings.findOneAndUpdate(
    { key },
    { value },
    { upsert: true, new: true }
  );
}
