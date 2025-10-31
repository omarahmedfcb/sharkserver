const FAQ = require("../../models/faq");

const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findById(id);
    
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    await FAQ.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { deleteFAQ };

