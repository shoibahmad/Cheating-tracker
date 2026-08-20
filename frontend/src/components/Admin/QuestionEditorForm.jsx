/**
 * QuestionEditorForm.jsx - Interactive form component for adding, editing, and deleting exam questions.
 */

import React from 'react';
import { Plus, Trash2, CheckCircle, Circle, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export const QuestionEditorForm = ({ questions, setQuestions }) => {
  const addQuestion = () => {
    const newId = `q${questions.length + 1}`;
    setQuestions([
      ...questions,
      { id: newId, type: 'mcq', text: '', options: ['', '', '', ''], correct_answer: 0 },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      toast.error('At least one question is required');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  return (
    <div className="glass-card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', color: 'var(--accent-primary)' }}>
            <BookOpen size={20} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Questions ({questions.length})</h3>
        </div>

        <button
          type="button"
          onClick={addQuestion}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
        >
          <Plus size={16} /> Add Question
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {questions.map((q, qIndex) => (
          <div
            key={q.id || qIndex}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Question {qIndex + 1}</span>
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-alert)', cursor: 'pointer' }}
                aria-label={`Delete question ${qIndex + 1}`}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <textarea
                className="glass-input"
                placeholder="Enter question text..."
                value={q.text}
                onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                required
                style={{ width: '100%', minHeight: '80px', marginBottom: '0.5rem' }}
              />
            </div>

            {/* MCQ Options */}
            {q.type === 'mcq' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Options (select the correct radio):</span>
                {q.options.map((opt, oIndex) => (
                  <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: q.correct_answer === oIndex ? 'var(--accent-success, #10b981)' : 'var(--text-secondary)' }}
                      aria-label={`Option ${oIndex + 1} correct`}
                    >
                      {q.correct_answer === oIndex ? <CheckCircle size={18} /> : <Circle size={18} />}
                    </button>
                    <input
                      type="text"
                      className="glass-input"
                      placeholder={`Option ${oIndex + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      required
                      style={{ flex: 1 }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
