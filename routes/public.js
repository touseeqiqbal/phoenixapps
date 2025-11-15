const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { sendSubmissionNotification } = require("../utils/emailService");

const router = express.Router();
const FORMS_FILE = path.join(__dirname, "../data/forms.json");
const SUBMISSIONS_FILE = path.join(__dirname, "../data/submissions.json");

// Get forms
async function getForms() {
  try {
    const data = await fs.readFile(FORMS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Get submissions
async function getSubmissions() {
  try {
    const data = await fs.readFile(SUBMISSIONS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Save submissions
async function saveSubmissions(submissions) {
  await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
}

// Get public form by share key
router.get("/form/:shareKey", async (req, res) => {
  try {
    const forms = await getForms();
    const form = forms.find((f) => f.shareKey === req.params.shareKey);

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    // Return form without sensitive data
    const publicForm = {
      id: form.id,
      title: form.title,
      fields: form.fields,
      settings: form.settings,
    };

    res.json(publicForm);
  } catch (error) {
    console.error("Get public form error:", error);
    res.status(500).json({ error: "Failed to fetch form" });
  }
});

// Submit form
router.post("/form/:shareKey/submit", async (req, res) => {
  try {
    const forms = await getForms();
    const form = forms.find((f) => f.shareKey === req.params.shareKey);

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    const { data: submissionData } = req.body;

    const submissions = await getSubmissions();
    const newSubmission = {
      id: Date.now().toString(),
      formId: form.id,
      data: submissionData,
      submittedAt: new Date().toISOString(),
      ipAddress: req.ip,
    };

    submissions.push(newSubmission);
    await saveSubmissions(submissions);

    // Send email notifications if enabled
    if (form.settings?.emailNotifications?.enabled) {
      try {
        const ownerEmail = form.settings.emailNotifications.notifyOwner 
          ? form.settings.emailNotifications.ownerEmail 
          : null;
        
        const submitterEmail = form.settings.emailNotifications.notifySubmitter 
          ? submissionData[form.settings.emailNotifications.submitterEmailField]
          : null;

        if (ownerEmail || submitterEmail) {
          await sendSubmissionNotification({
            form,
            submission: newSubmission,
            ownerEmail,
            submitterEmail
          });
        }
      } catch (emailError) {
        console.error("Email notification error:", emailError);
        // Don't fail the submission if email fails
      }
    }

    res.json({
      success: true,
      message: form.settings?.confirmationMessage || "Thank you for your submission!",
    });
  } catch (error) {
    console.error("Submit form error:", error);
    res.status(500).json({ error: "Failed to submit form" });
  }
});

module.exports = router;
