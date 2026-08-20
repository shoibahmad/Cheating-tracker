/**
 * Renders individual exam questions (MCQ or Descriptive) with option selection and navigation.
 */

import React from 'react';

export const QuestionRenderer = ({
  question,
  index,
  totalQuestions,
  answer,
  onAnswerChange,
  onNext,
  onPrev,
  onSubmit,
}) => {
  if (!question) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>No question available.</div>;
  }

  const isMCQ = question.type === 'mcq' || (question.options && question.options.length > 0);

  return (
    <div
      data-testid="question-renderer"
      className="glass-panel"
      style={{ padding: '2rem', borderRadius: '1rem', marginBottom: '1.5rem' }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '0.75rem',
        }}
      >
        <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>
          Question {index + 1} of {totalQuestions}
        </span>
        <span
          style={{
            fontSize: '0.85rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '1rem',
            background: isMCQ ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
            color: isMCQ ? '#60a5fa' : '#c084fc',
          }}
        >
          {isMCQ ? 'Multiple Choice' : 'Descriptive'} ({question.marks || 1} mark{question.marks > 1 ? 's' : ''})
        </span>
      </div>

      {/* Question Text */}
      <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        {question.text}
      </h3>

      {/* Answer Options */}
      {isMCQ ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {(question.options || []).map((opt, optIdx) => {
            const optText = typeof opt === 'object' ? opt.text : opt;
            const isSelected = String(answer) === String(optIdx);

            return (
              <label
                key={optIdx}
                data-testid={`option-${optIdx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderRadius: '0.5rem',
                  background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="radio"
                  name={`question-${question.id ?? index}`}
                  value={optIdx}
                  checked={isSelected}
                  onChange={() => onAnswerChange(question.id ?? index, optIdx)}
                  style={{ accentColor: '#3b82f6' }}
                />
                <span style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>{optText}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <div style={{ marginBottom: '2rem' }}>
          <textarea
            data-testid="descriptive-input"
            rows={6}
            placeholder="Type your detailed answer here..."
            value={answer || ''}
            onChange={(e) => onAnswerChange(question.id ?? index, e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '0.5rem',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              fontSize: '1rem',
              resize: 'vertical',
            }}
          />
        </div>
      )}

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onPrev}
          disabled={index === 0}
          style={{ opacity: index === 0 ? 0.5 : 1 }}
        >
          Previous
        </button>

        {index < totalQuestions - 1 ? (
          <button type="button" className="btn btn-primary" onClick={onNext}>
            Next Question
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSubmit}
            style={{ background: '#10b981', borderColor: '#10b981' }}
          >
            Submit Exam
          </button>
        )}
      </div>
    </div>
  );
};
