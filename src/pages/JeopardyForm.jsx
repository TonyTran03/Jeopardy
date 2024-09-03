import React, { useState } from 'react';

export default function JeopardyForm({ onSubmit }) {
  const [questionText, setQuestionText] = useState('');
  const [category, setCategory] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [answerImageBase64, setAnswerImageBase64] = useState('');
  const [points, setPoints] = useState(100);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setAnswerImageBase64(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newQuestion = {
      question: questionText,
      category: category,
      answer: {
        text: answerText,
        image: answerImageBase64,  // Store the base64 image string
      },
      points: points,
    };

    // Call the onSubmit prop function to pass the new question to the parent component
    onSubmit(newQuestion);

    // Reset form fields
    setQuestionText('');
    setCategory('');
    setAnswerText('');
    setAnswerImageBase64('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Question:</label>
        <input
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="text-black bg-gray-200 border border-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <label>Category:</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-black bg-gray-200 border border-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <label>Answer (Text):</label>
        <input
          type="text"
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          className="text-black bg-gray-200 border border-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <label>Answer (Image):</label>
        <input
          type="file"
          onChange={handleImageUpload}
          className="text-black bg-gray-200 border border-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>
      <button type="submit">Create Question</button>
    </form>
  );
}
