/**
 * AIGeneratorPanel.jsx - Extracted AI content prompt and question generator component.
 */

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { examsService } from '../../services/examsService';
import { logger } from '../../utils/logger';

export const AIGeneratorPanel = ({ onQuestionsGenerated, onTitleGenerated }) => {
  const [aiContent, setAiContent] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleAIGenerate = async () => {
    if (!aiContent.trim()) {
      toast.error('Please provide some content for AI to analyze.');
      return;
    }

    const toastId = toast.loading('AI is crafting your exam...');
    setGenerating(true);

    try {
      const data = await examsService.generateQuestionsFromContent(aiContent);

      if (data.questions && data.questions.length > 0) {
        const formatted = data.questions.map((q, idx) => ({
          id: `ai_${Date.now()}_${idx}`,
          type: q.type || 'mcq',
          text: q.text,
          options: q.options || ['', '', '', ''],
          correct_answer: q.correct_answer || 0,
        }));

        onQuestionsGenerated(formatted);
        if (data.title && onTitleGenerated) {
          onTitleGenerated(data.title);
        }
        toast.success(`Generated ${data.questions.length} questions!`, { id: toastId });
        setAiContent('');
      } else {
        toast.error("AI couldn't generate questions from this content.", { id: toastId });
      }
    } catch (err) {
      logger.error('AI question generation failed', err);
      toast.error('AI Generation Failed: ' + err.message, { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        marginBottom: '2rem',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        background: 'rgba(139, 92, 246, 0.05)',
        padding: '1.5rem',
        borderRadius: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.5rem', background: '#8b5cf6', borderRadius: '8px', color: '#fff' }}>
          <Sparkles size={20} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>AI Question Generator</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>
            Paste text or content summary to generate questions instantly.
          </p>
        </div>
      </div>

      <textarea
        className="glass-input"
        placeholder="Paste textbook content, notes, or a topic summary here..."
        value={aiContent}
        onChange={(e) => setAiContent(e.target.value)}
        style={{ minHeight: '110px', marginBottom: '1rem', width: '100%' }}
      />

      <button
        type="button"
        className="btn"
        onClick={handleAIGenerate}
        disabled={generating}
        style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
          color: '#fff',
          fontWeight: 600,
          border: 'none',
          padding: '0.6rem 1.2rem',
          borderRadius: '8px',
          cursor: generating ? 'not-allowed' : 'pointer',
        }}
      >
        <Sparkles size={16} style={{ marginRight: '6px' }} />
        {generating ? 'Generating Questions...' : 'Generate with AI'}
      </button>
    </div>
  );
};
