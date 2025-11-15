const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const router = express.Router();
const SUBMISSIONS_FILE = path.join(__dirname, "../data/submissions.json");
const FORMS_FILE = path.join(__dirname, "../data/forms.json");

// Get submissions
async function getSubmissions() {
  try {
    const data = await fs.readFile(SUBMISSIONS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Get forms
async function getForms() {
  try {
    const data = await fs.readFile(FORMS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Get all submissions for user's forms
router.get("/", async (req, res) => {
  try {
    const forms = await getForms();
    const userId = req.user.uid || req.user.id;
    const userForms = forms.filter((f) => f.userId === userId);
    const formIds = userForms.map((f) => f.id);

    const submissions = await getSubmissions();
    const userSubmissions = submissions.filter((s) => formIds.includes(s.formId));

    // Attach form title to each submission
    const submissionsWithForm = userSubmissions.map((submission) => {
      const form = userForms.find((f) => f.id === submission.formId);
      return {
        ...submission,
        formTitle: form?.title || "Unknown Form",
      };
    });

    res.json(submissionsWithForm);
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// Get submissions for a specific form
router.get("/form/:formId", async (req, res) => {
  try {
    const forms = await getForms();
    const form = forms.find((f) => f.id === req.params.formId);

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    const userId = req.user.uid || req.user.id;
    if (form.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const submissions = await getSubmissions();
    const formSubmissions = submissions.filter((s) => s.formId === req.params.formId);

    res.json(formSubmissions);
  } catch (error) {
    console.error("Get form submissions error:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// Delete submission
router.delete("/:id", async (req, res) => {
  try {
    const forms = await getForms();
    const userId = req.user.uid || req.user.id;
    const userForms = forms.filter((f) => f.userId === userId);
    const formIds = userForms.map((f) => f.id);

    const submissions = await getSubmissions();
    const submission = submissions.find((s) => s.id === req.params.id);

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (!formIds.includes(submission.formId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updatedSubmissions = submissions.filter((s) => s.id !== req.params.id);
    await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(updatedSubmissions, null, 2));

    res.json({ message: "Submission deleted successfully" });
  } catch (error) {
    console.error("Delete submission error:", error);
    res.status(500).json({ error: "Failed to delete submission" });
  }
});

module.exports = router;
