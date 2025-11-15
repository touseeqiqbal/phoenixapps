const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

const router = express.Router();
const FORMS_FILE = path.join(__dirname, "../data/forms.json");

// Initialize forms file
async function initFormsFile() {
  try {
    await fs.access(FORMS_FILE);
  } catch {
    await fs.writeFile(FORMS_FILE, JSON.stringify([], null, 2));
  }
}

// Get all forms
async function getForms() {
  await initFormsFile();
  const data = await fs.readFile(FORMS_FILE, "utf8");
  return JSON.parse(data);
}

// Save forms
async function saveForms(forms) {
  await fs.writeFile(FORMS_FILE, JSON.stringify(forms, null, 2));
}

// Get user's forms
router.get("/", async (req, res) => {
  try {
    const forms = await getForms();
    const userId = req.user.uid || req.user.id; // Support both Firebase UID and legacy ID
    const userForms = forms.filter((f) => f.userId === userId);
    res.json(userForms);
  } catch (error) {
    console.error("Get forms error:", error);
    res.status(500).json({ error: "Failed to fetch forms" });
  }
});

// Get single form
router.get("/:id", async (req, res) => {
  try {
    const forms = await getForms();
    const form = forms.find((f) => f.id === req.params.id);

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    const userId = req.user.uid || req.user.id;
    if (form.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(form);
  } catch (error) {
    console.error("Get form error:", error);
    res.status(500).json({ error: "Failed to fetch form" });
  }
});

// Create form
router.post("/", async (req, res) => {
  try {
    const { title, fields, settings } = req.body;

    // Check if user is authenticated
    if (!req.user || (!req.user.uid && !req.user.id)) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const forms = await getForms();
    const userId = req.user.uid || req.user.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Invalid user ID" });
    }

    const newForm = {
      id: crypto.randomBytes(16).toString("hex"),
      userId: userId,
      title: title || "Untitled Form",
      fields: fields || [],
      settings: settings || {
        theme: "default",
        allowMultipleSubmissions: true,
        showProgressBar: true,
        confirmationMessage: "Thank you for your submission!",
      },
      shareKey: crypto.randomBytes(8).toString("hex"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    forms.push(newForm);
    await saveForms(forms);

    res.status(201).json(newForm);
  } catch (error) {
    console.error("Create form error:", error);
    res.status(500).json({ error: "Failed to create form", details: error.message });
  }
});

// Update form
router.put("/:id", async (req, res) => {
  try {
    const forms = await getForms();
    const formIndex = forms.findIndex((f) => f.id === req.params.id);

    if (formIndex === -1) {
      return res.status(404).json({ error: "Form not found" });
    }

    const userId = req.user.uid || req.user.id;
    if (forms[formIndex].userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updatedForm = {
      ...forms[formIndex],
      ...req.body,
      id: forms[formIndex].id,
      userId: forms[formIndex].userId,
      shareKey: forms[formIndex].shareKey,
      createdAt: forms[formIndex].createdAt,
      updatedAt: new Date().toISOString(),
    };

    forms[formIndex] = updatedForm;
    await saveForms(forms);

    res.json(updatedForm);
  } catch (error) {
    console.error("Update form error:", error);
    res.status(500).json({ error: "Failed to update form" });
  }
});

// Delete form
router.delete("/:id", async (req, res) => {
  try {
    const forms = await getForms();
    const formIndex = forms.findIndex((f) => f.id === req.params.id);

    if (formIndex === -1) {
      return res.status(404).json({ error: "Form not found" });
    }

    const userId = req.user.uid || req.user.id;
    if (forms[formIndex].userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    forms.splice(formIndex, 1);
    await saveForms(forms);

    res.json({ message: "Form deleted successfully" });
  } catch (error) {
    console.error("Delete form error:", error);
    res.status(500).json({ error: "Failed to delete form" });
  }
});

module.exports = router;
