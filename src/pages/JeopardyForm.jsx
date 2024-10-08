import React, { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

export default function JeopardyForm({ onSubmit }) {
  const [open, setOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [category, setCategory] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [answerImageBase64, setAnswerImageBase64] = useState("");
  const [questionImageBase64, setQuestionImageBase64] = useState(""); // Add state for question image
  const [points, setPoints] = useState(100);

  // Handle image upload for answer
  const handleAnswerImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setAnswerImageBase64(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload for question
  const handleQuestionImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setQuestionImageBase64(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newQuestion = {
      question: {
        text: questionText,
        image: questionImageBase64, // Store the base64 image string for the question
      },
      category: category,
      answer: {
        text: answerText,
        image: answerImageBase64, // Store the base64 image string for the answer
      },
      points: points,
    };

    onSubmit(newQuestion);

    setQuestionText("");
    setCategory("");
    setAnswerText("");
    setAnswerImageBase64("");
    setQuestionImageBase64(""); // Reset question image state
    setOpen(false); // Close the dialog after submission
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        Open Jeopardy Form
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Question</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Question:</label>
              <input
                type="text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className=" bg-gray-200 border border-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label>Question (Image):</label>
              <input
                type="file"
                onChange={handleQuestionImageUpload}
                className=" bg-gray-200 border border-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label>Category:</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className=" bg-gray-200 border border-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label>Answer (Text):</label>
              <input
                type="text"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                className=" bg-gray-200 border border-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label>Answer (Image):</label>
              <input
                type="file"
                onChange={handleAnswerImageUpload}
                className=" bg-gray-200 border border-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit">Create Question</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
