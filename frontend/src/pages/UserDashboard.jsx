import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DashboardContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  padding: 10px 20px;
  background: ${props => props.active ? '#007bff' : '#ddd'};
  color: ${props => props.active ? 'white' : '#333'};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover { background: #0056b3; color: white; }
`;

const AssessmentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 500px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 16px;
`;

const Textarea = styled.textarea`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
  min-height: 100px;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  min-width: 44px;
  min-height: 44px;
  font-size: 16px;
  &:hover { background-color: #0056b3; }
  &:disabled { background-color: #ccc; cursor: not-allowed; }
`;

const AssessmentList = styled.ul`
  list-style: none;
  padding: 0;
`;

const AssessmentItem = styled.li`
  padding: 10px;
  border-bottom: 1px solid #ddd;
  margin-bottom: 10px;
`;

const AssessmentTitle = styled.h3`
  margin: 0;
  font-size: 1.5rem;
`;

const QuestionTitleList = styled.ul`
  list-style: none;
  padding-left: 20px;
  margin-top: 10px;
`;

const QuestionTitleItem = styled.li`
  padding: 5px 0;
`;

const QuestionTitle = styled.p`
  cursor: pointer;
  margin: 0;
  font-size: 1.1rem;
  &:hover { color: #007bff; }
`;

const QuestionDetails = styled.div`
  margin-top: 10px;
  padding-left: 20px;
`;

const QuestionText = styled.p`
  margin: 0 0 10px;
  font-size: 1.1rem;
`;

const AnswerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (min-width: 600px) {
    flex-direction: row;
    align-items: center;
  }
`;

const ChoiceLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 16px;
`;

const FeedbackMessage = styled.span`
  color: ${props => props.correct ? '#28a745' : '#dc3545'};
  font-size: 0.9rem;
  margin-left: 10px;
`;

const ProgressReport = styled.div`
  margin-top: 20px;
`;

const ProgressBar = styled.div`
  width: 100%;
  background: #ddd;
  height: 20px;
  border-radius: 5px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  width: ${props => props.percentage}%;
  background: #007bff;
  height: 100%;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9rem;
`;

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('assessments');
  const [assessments, setAssessments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [newAssessment, setNewAssessment] = useState({ courseId: '', title: '', questions: [{ question_text: '', correct_answer: '', type: 'short-answer', choices: [] }] });
  const [responses, setResponses] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState({});
  const [expandedAssessments, setExpandedAssessments] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const courseId = 1; // Replace with dynamic selection

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');
        const [assessmentsRes, progressRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/assessments/course/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5000/api/assessments/progress/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        setAssessments(assessmentsRes.data);
        setProgress(progressRes.data);
        const status = {};
        progressRes.data.forEach(assessment => {
          assessment.questions.forEach(q => {
            if (q.student_answer) {
              status[q.id] = q.is_correct;
            }
          });
        });
        setSubmissionStatus(status);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load data. Please check your connection.');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/assessments', newAssessment, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewAssessment({ courseId: '', title: '', questions: [{ question_text: '', correct_answer: '', type: 'short-answer', choices: [] }] });
      const res = await axios.get(`http://localhost:5000/api/assessments/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssessments(res.data);
      setError('Assessment created successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create assessment');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSubmit = async (questionId) => {
    const studentAnswer = responses[questionId];
    if (!studentAnswer) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/assessments/response', { questionId, studentAnswer }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Answer submitted!', { position: 'top-right', autoClose: 2000 });
      const res = await axios.get(`http://localhost:5000/api/assessments/progress/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgress(res.data);
      const question = res.data
        .flatMap(a => a.questions)
        .find(q => q.id === questionId);
      const isCorrect = question.is_correct;
      setSubmissionStatus(prev => ({ ...prev, [questionId]: isCorrect }));
      setResponses(prev => ({ ...prev, [questionId]: '' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit response');
      toast.error('Failed to submit answer', { position: 'top-right', autoClose: 2000 });
      console.error('Response error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addQuestionField = () => {
    setNewAssessment(prev => ({
      ...prev,
      questions: [...prev.questions, { question_text: '', correct_answer: '', type: 'short-answer', choices: [] }]
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...newAssessment.questions];
    updatedQuestions[index][field] = value;
    setNewAssessment({ ...newAssessment, questions: updatedQuestions });
  };

  const handleRemoveQuestion = (index) => {
    setNewAssessment(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const toggleAssessment = (id) => {
    setExpandedAssessments(prev => ({ ...prev, [id]: !prev[id] }));
    // Collapse all questions when closing assessment
    if (expandedAssessments[id]) {
      setExpandedQuestions(prev => {
        const newState = { ...prev };
        assessments.find(a => a.id === id).questions.forEach(q => delete newState[q.id]);
        return newState;
      });
    }
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  return (
    <DashboardContainer>
      <Title>Student Dashboard</Title>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <TabContainer>
            <Tab active={activeTab === 'assessments'} onClick={() => setActiveTab('assessments')}>
              Assessments
            </Tab>
            <Tab active={activeTab === 'progress'} onClick={() => setActiveTab('progress')}>
              Progress Reports
            </Tab>
          </TabContainer>

          {activeTab === 'assessments' && (
            <>
              {user.role === 'instructor' && (
                <AssessmentForm onSubmit={handleAssessmentSubmit}>
                  <Input
                    type="text"
                    placeholder="Course ID"
                    value={newAssessment.courseId}
                    onChange={(e) => setNewAssessment({ ...newAssessment, courseId: e.target.value })}
                    required
                    disabled={loading}
                  />
                  <Input
                    type="text"
                    placeholder="Assessment Title"
                    value={newAssessment.title}
                    onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
                    required
                    disabled={loading}
                  />
                  {newAssessment.questions.map((q, index) => (
                    <div key={index} style={{ marginBottom: '10px' }}>
                      <Textarea
                        placeholder={`Question ${index + 1}`}
                        value={q.question_text}
                        onChange={(e) => handleQuestionChange(index, 'question_text', e.target.value)}
                        required
                        disabled={loading}
                      />
                      <Input
                        type="text"
                        placeholder="Correct Answer"
                        value={q.correct_answer}
                        onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)}
                        required
                        disabled={loading}
                      />
                      {newAssessment.questions.length > 1 && (
                        <Button type="button" onClick={() => handleRemoveQuestion(index)} disabled={loading}>
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" onClick={addQuestionField} disabled={loading}>Add Question</Button>
                  <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Assessment'}</Button>
                </AssessmentForm>
              )}
              <AssessmentList>
                {assessments.map(assessment => (
                  <AssessmentItem key={assessment.id}>
                    <AssessmentTitle>{assessment.title}</AssessmentTitle>
                    <Button 
                      onClick={() => toggleAssessment(assessment.id)}
                      aria-expanded={expandedAssessments[assessment.id]}
                      aria-label={`View questions for ${assessment.title}`}
                    >
                      {expandedAssessments[assessment.id] ? 'Hide Questions' : 'View Questions'}
                    </Button>
                    {expandedAssessments[assessment.id] && (
                      <QuestionTitleList>
                        {assessment.questions.map(q => (
                          <QuestionTitleItem key={q.id}>
                            <QuestionTitle 
                              onClick={() => toggleQuestion(q.id)}
                              aria-expanded={expandedQuestions[q.id]}
                              aria-label={`Expand ${q.question_text}`}
                            >
                              {q.question_text.length > 50 ? `${q.question_text.substring(0, 50)}...` : q.question_text}
                              <span style={{ marginLeft: '5px' }}>{expandedQuestions[q.id] ? '▼' : '▶'}</span>
                            </QuestionTitle>
                            {expandedQuestions[q.id] && (
                              <QuestionDetails>
                                <QuestionText>{q.question_text}</QuestionText>
                                {user.role === 'student' && (
                                  <AnswerContainer>
                                    {q.type === 'short-answer' ? (
                                      <Input
                                        type="text"
                                        value={responses[q.id] || ''}
                                        onChange={(e) => setResponses(prev => ({ ...prev, [q.id]: e.target.value }))}
                                        placeholder="Your answer"
                                        disabled={loading || submissionStatus[q.id] !== undefined}
                                        aria-label={`Answer for ${q.question_text}`}
                                      />
                                    ) : (
                                      <div>
                                        {q.choices.map((choice, index) => (
                                          <ChoiceLabel key={index}>
                                            <input
                                              type="radio"
                                              name={`question-${q.id}`}
                                              value={choice}
                                              checked={responses[q.id] === choice}
                                              onChange={(e) => setResponses(prev => ({ ...prev, [q.id]: e.target.value }))}
                                              disabled={loading || submissionStatus[q.id] !== undefined}
                                            />
                                            {choice}
                                          </ChoiceLabel>
                                        ))}
                                      </div>
                                    )}
                                    <Button 
                                      onClick={() => handleResponseSubmit(q.id)} 
                                      onKeyPress={(e) => e.key === 'Enter' && handleResponseSubmit(q.id)}
                                      disabled={loading || !responses[q.id] || submissionStatus[q.id] !== undefined}
                                      aria-label={`Submit answer for ${q.question_text}`}
                                    >
                                      Submit
                                    </Button>
                                    {submissionStatus[q.id] !== undefined && (
                                      <FeedbackMessage correct={submissionStatus[q.id]}>
                                        {submissionStatus[q.id] ? 'Correct!' : 'Incorrect'}
                                      </FeedbackMessage>
                                    )}
                                  </AnswerContainer>
                                )}
                              </QuestionDetails>
                            )}
                          </QuestionTitleItem>
                        ))}
                      </QuestionTitleList>
                    )}
                  </AssessmentItem>
                ))}
              </AssessmentList>
            </>
          )}

          {activeTab === 'progress' && user.role === 'student' && (
            <ProgressReport>
              {progress.length === 0 ? (
                <p>No progress data available yet.</p>
              ) : (
                progress.map(assessment => {
                  const totalQuestions = assessment.questions.length;
                  const answered = assessment.questions.filter(q => q.student_answer).length;
                  const correct = assessment.questions.filter(q => q.is_correct).length;
                  const percentage = totalQuestions ? (correct / totalQuestions) * 100 : 0;

                  return (
                    <div key={assessment.id} style={{ marginBottom: '20px' }}>
                      <h3>{assessment.title}</h3>
                      <p>Questions Answered: {answered}/{totalQuestions}</p>
                      <p>Correct Answers: {correct}/{totalQuestions}</p>
                      <ProgressBar>
                        <ProgressFill percentage={percentage} />
                      </ProgressBar>
                      <p>Score: {percentage.toFixed(2)}%</p>
                    </div>
                  );
                })
              )}
            </ProgressReport>
          )}
        </>
      )}
      <ToastContainer />
    </DashboardContainer>
  );
};

export default UserDashboard;