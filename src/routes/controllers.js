import { email } from "../models/db.js";

const createNewEmail = async (req, res) => {
  const newEmailObj = req.body;
  const emaildb = new email({
    ...newEmailObj,
    createdAt: new Date().toISOString(),
  });
  try {
    await emaildb.save();
    res.status(201).json(emaildb);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export { createNewEmail };
