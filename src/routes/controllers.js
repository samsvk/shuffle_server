const doSomething = async (req, res) => {
  try {
    console.log("hitting this my g");
    return res.json({
      working: true,
    });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

export { doSomething };
