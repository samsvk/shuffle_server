import mongoose from "mongoose";

export const db = mongoose.connect(
  "mongodb://localhost:27017/emails",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const emailSchema = mongoose.Schema({
  parentEmail: {
    type: String,
  },
  childEmails: [
    {
      type: String,
    },
  ],
});

export const email = mongoose.model("Email", emailSchema);
