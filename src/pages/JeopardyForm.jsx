import React, { useState } from 'react';

export default function JeopardyForm({ onSubmit }) {
  const [questionText, setQuestionText] = useState('');
  const [category, setCategory] = useState('');
  const [answer, setAnswer] = useState('');
  const [points, setPoints] = useState(100);

  const handleSubmit = (event) => {
    event.preventDefault();

    const newQuestion = {
      question: questionText,
      category: category,
      answer: answer,
      points: points,
    };

    // Call the onSubmit prop function to pass the new question to the parent component
    onSubmit(newQuestion);

    // Reset form fields
    setQuestionText('');
    setCategory('');
    setAnswer('');
    setPoints(100);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Question:</label>
        <input
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
      </div>
      <div>
        <label>Category:</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>
      <div>
        <label>Answer:</label>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
      </div>
      <div>
        <label>Points:</label>
        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
        />
      </div>
      <button type="submit">Create Question</button>
    </form>
  );
}
