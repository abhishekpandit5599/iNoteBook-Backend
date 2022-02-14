const express = require("express");
const fetchUser = require("../middleware/fetchUser");
const Notes = require("../models/Notes");
const router = express.Router();
const { body, validationResult } = require("express-validator");

// Route 1 : Get all the notes using GET "/api/notes/fetchallnotes". Login Required
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  const notes = await Notes.find({ user: req.user.id });
  res.json(notes);
});

// Route 2 : Add aa new notes using POST "/api/notes/addnote". Login Required
router.post(
  "/addnote",
  fetchUser,
  [
    body("title").isLength({ min: 5 }),
    body("description").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const saveNote = await note.save();

      res.json(saveNote);
    } catch (error) {
      console.log(error);
      res.status(500).send("Some Error occured");
    }
  }
);

// Route 3 :Update a notes using PUT "/api/notes/updatenote". Login Required
router.put("/updatenote/:id", fetchUser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    // Ceate a new note object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    // Find the note to be updated and update it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.log(error);
    res.status(500).send("Some Error occured");
  }
});

// Route 4 : Delete a notes using DELETE "/api/notes/deletenote". Login Required
router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  try {
    // Find the note to be delete and delete it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.status(200).json({ note });
  } catch (error) {
    console.log(error);
    res.status(500).send("Some Error occured");
  }
});

module.exports = router;
