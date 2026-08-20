/**
 * CreatePaperPage.jsx - Admin page for authoring question papers.
 * Composes AIGeneratorPanel and QuestionEditorForm subcomponents.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { BackButton } from '../../components/Common/BackButton';
import { AIGeneratorPanel } from '../../components/Admin/AIGeneratorPanel';
import { QuestionEditorForm } from '../../components/Admin/QuestionEditorForm';
import { examsService } from '../../services/examsService';
import { logger } from '../../utils/logger';
import { sharedStyles } from '../../styles/sharedStyles';
import { useAuth } from '../../context/AuthContext';

export const CreatePaperPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [questions, setQuestions] = useState([
    { id: 'q1', type: 'mcq', text: '', options: ['', '', '', ''], correct_answer: 0 },
  ]);

  const handleQuestionsGenerated = (generatedQuestions) => {
    setQuestions((prev) => {
      if (prev.length === 1 && !prev[0].text) return generatedQuestions;
      return [...prev, ...generatedQuestions];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !subject.trim()) {
      toast.error('Please fill in paper details');
      return;
    }

    const toastId = toast.loading('Saving paper...');

    try {
      const paper = {
        title,
        subject,
        questions: questions.map((q) => ({
          type: q.type || 'mcq',
          text: q.text,
          options: q.type === 'mcq' ? q.options : [],
          correct_answer: q.type === 'mcq' ? q.correct_answer : null,
        })),
        status: 'draft',
      };

      await examsService.createPaper(paper, currentUser ? currentUser.uid : 'admin');

      toast.success('Question Paper Created Successfully!', { id: toastId });
      navigate('/admin/dashboard');
    } catch (err) {
      logger.error('Error creating question paper', err);
      toast.error('Error creating paper: ' + err.message, { id: toastId });
    }
  };

  return (
    <div className="container" style={{ maxWidth: '900px', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={sharedStyles.headerContainer}>
        <BackButton to="/admin/dashboard" label="Back to Dashboard" style={{ marginBottom: '1rem' }} />
        <h2 style={sharedStyles.title}>Create Question Paper</h2>
        <p style={sharedStyles.subtitle}>Design a new exam paper for students</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Paper Details Card */}
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={sharedStyles.iconBadge('rgba(99, 102, 241, 0.1)', 'var(--accent-primary)')}>
              <FileText size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Paper Details</h3>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
            <div>
              <label style={sharedStyles.label}>Paper Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-input"
                required
                placeholder="e.g. Mid-Term Physics 2024"
                style={{ fontSize: '1rem' }}
              />
            </div>
            <div>
              <label style={sharedStyles.label}>Subject / Course</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="glass-input"
                required
                placeholder="e.g. Physics 101"
                style={{ fontSize: '1rem' }}
              />
            </div>
          </div>
        </div>

        {/* AI Question Generator Panel */}
        <AIGeneratorPanel
          onQuestionsGenerated={handleQuestionsGenerated}
          onTitleGenerated={(genTitle) => {
            if (!title) setTitle(genTitle);
          }}
        />

        {/* Question Editor Form */}
        <QuestionEditorForm questions={questions} setQuestions={setQuestions} />

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="btn btn-secondary"
            style={{ padding: '0.8rem 1.5rem' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem' }}
          >
            <Save size={18} /> Save Paper
          </button>
        </div>
      </form>
    </div>
  );
};
