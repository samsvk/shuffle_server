import { email } from "../models/db.js";
import { randomEmailGenerator } from "../utils.js";

const createNewEmail = async (req, res) => {
  const newEmailObj = req.body;
  const redirectChildEmail = randomEmailGenerator();
  const emaildb = new email({
    ...newEmailObj,
    childEmail: [redirectChildEmail],
    createdAt: new Date().toISOString(),
  });
  try {
    await emaildb.save();
    res.status(201).json(redirectChildEmail);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export { createNewEmail };
