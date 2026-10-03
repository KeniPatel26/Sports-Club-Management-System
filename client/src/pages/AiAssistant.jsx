import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  FileText,
  Tag,
  Lightbulb,
  Send,
  CheckCircle2,
  Bot,
  User,
  ArrowRight,
  Zap,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import aiService from '../services/aiService';
import { useToast } from '../context/ToastContext';

export const AiAssistant = () => {
  const { toastSuccess, toastError } = useToast();

  // Tab 1: Summarizer
  const [summaryInput, setSummaryInput] = useState(
    'MERN Stack combines MongoDB, Express.js, React, and Node.js to provide a robust JavaScript ecosystem for rapid full-stack web application development. During hackathons, pre-configuring authentication, modular UI kits, centralized error handling, and database schemas ensures that teams can immediately focus on the specific problem statement instead of wasting critical hours setting up boilerplate configurations.'
  );
  const [summaryResult, setSummaryResult] = useState(null);
  const [summarizing, setSummarizing] = useState(false);

  // Tab 2: Classifier
  const [classifyInput, setClassifyInput] = useState(
    'The server database query is failing when users attempt to process simultaneous invoice transactions during peak traffic hours.'
  );
  const [classifyResult, setClassifyResult] = useState(null);
  const [classifying, setClassifying] = useState(false);

  // Tab 3: Recommendations
  const [recs, setRecs] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Tab 4: Chatbot
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your Hackathon AI Assistant. Ask me about project architecture, REST APIs, or how to customize this starter kit for your problem statement!',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatting, setChatting] = useState(false);

  const handleSummarize = async () => {
    if (!summaryInput.trim()) return;
    try {
      setSummarizing(true);
      const res = await aiService.summarize(summaryInput);
      setSummaryResult(res.data);
      toastSuccess('Text analyzed & summarized successfully');
    } catch (err) {
      toastError('Summarization failed');
    } finally {
      setSummarizing(false);
    }
  };

  const handleClassify = async () => {
    if (!classifyInput.trim()) return;
    try {
      setClassifying(true);
      const res = await aiService.classify(classifyInput);
      setClassifyResult(res.data);
      toastSuccess('Entity categorized & prioritized');
    } catch (err) {
      toastError('Classification failed');
    } finally {
      setClassifying(false);
    }
  };

  const handleGetRecs = async () => {
    try {
      setLoadingRecs(true);
      const res = await aiService.getRecommendations();
      setRecs(res.data?.recommendations || []);
      toastSuccess('Smart recommendations generated');
    } catch (err) {
      toastError('Failed to generate recommendations');
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleSendChat = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setChatting(true);

    try {
      const res = await aiService.chat(userText);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.data?.reply || 'I processed your query.',
          suggestedActions: res.data?.suggestedActions || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'I can assist you with understanding any MERN architecture component or hackathon feature!',
        },
      ]);
    } finally {
      setChatting(false);
    }
  };

  const tabs = [
    {
      label: 'AI Chat Assistant',
      icon: MessageSquare,
      content: (
        <Card style={{ height: '620px', display: 'flex', flexDirection: 'column' }}>
          <Card.Header>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <Card.Title>Hackathon AI Copilot</Card.Title>
                <Card.Description>Ask questions or generate hackathon solutions</Card.Description>
              </div>
            </div>
          </Card.Header>

          <Card.Content style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                }}
              >
                {m.sender === 'ai' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--accent-light)',
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={16} />
                  </div>
                )}

                <div>
                  <div
                    style={{
                      padding: '0.85rem 1.15rem',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-subtle)',
                      color: m.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                      border: m.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    }}
                  >
                    {m.text}
                  </div>

                  {m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      {m.suggestedActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          type="button"
                          onClick={() => {
                            setChatInput(action);
                          }}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.6rem',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-full)',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                          }}
                        >
                          ⚡ {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
            {chatting && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Loader size="sm" text="Thinking..." inline />
              </div>
            )}
          </Card.Content>

          <Card.Footer style={{ padding: '1rem' }}>
            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '0.6rem', width: '100%' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask anything about this project..."
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                }}
              />
              <Button type="submit" variant="primary" icon={Send} disabled={!chatInput.trim() || chatting}>
                Send
              </Button>
            </form>
          </Card.Footer>
        </Card>
      ),
    },
    {
      label: 'Document Summarizer',
      icon: FileText,
      content: (
        <div className="grid-cols-2">
          <Card>
            <Card.Header>
              <Card.Title>Input Document / Text</Card.Title>
            </Card.Header>
            <Card.Content>
              <Textarea
                value={summaryInput}
                onChange={(e) => setSummaryInput(e.target.value)}
                rows={9}
                placeholder="Paste paragraph or document here to extract key summaries..."
              />
              <Button
                variant="primary"
                icon={Sparkles}
                onClick={handleSummarize}
                loading={summarizing}
                style={{ marginTop: '1rem' }}
              >
                Summarize Content
              </Button>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>AI Summary & Insights</Card.Title>
            </Card.Header>
            <Card.Content>
              {summaryResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-light)',
                      border: '1px solid rgba(79,70,229,0.2)',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                      EXECUTIVE SUMMARY
                    </span>
                    <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.925rem', lineHeight: 1.5 }}>
                      {summaryResult.summary}
                    </p>
                  </div>

                  <div>
                    <h5 style={{ margin: '0 0 0.5rem 0', fontWeight: 700 }}>Key Extracted Takeaways</h5>
                    <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {summaryResult.keyPoints?.map((pt, idx) => (
                        <li key={idx} style={{ marginBottom: '0.4rem' }}>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Badge variant="success">Sentiment: {summaryResult.stats?.sentiment}</Badge>
                    <Badge variant="info">Read Time: {summaryResult.stats?.estimatedReadingTime}</Badge>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 1rem' }}>
                  Click "Summarize Content" to extract key points and metrics.
                </p>
              )}
            </Card.Content>
          </Card>
        </div>
      ),
    },
    {
      label: 'Smart Issue Classifier',
      icon: Tag,
      content: (
        <div className="grid-cols-2">
          <Card>
            <Card.Header>
              <Card.Title>Input Ticket or Query</Card.Title>
            </Card.Header>
            <Card.Content>
              <Textarea
                value={classifyInput}
                onChange={(e) => setClassifyInput(e.target.value)}
                rows={6}
                placeholder="Enter bug report, customer ticket, or inquiry..."
              />
              <Button
                variant="primary"
                icon={Zap}
                onClick={handleClassify}
                loading={classifying}
                style={{ marginTop: '1rem' }}
              >
                Auto-Classify & Route
              </Button>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Classification Output</Card.Title>
            </Card.Header>
            <Card.Content>
              {classifyResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      ASSIGNED CATEGORY
                    </span>
                    <h3 style={{ margin: '0.2rem 0 0 0', color: 'var(--primary)' }}>
                      {classifyResult.category}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Badge variant={classifyResult.priority === 'urgent' ? 'danger' : 'warning'}>
                      Priority: {classifyResult.priority}
                    </Badge>
                    <Badge variant="success">Confidence: {Math.round(classifyResult.confidence * 100)}%</Badge>
                  </div>

                  <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      {classifyResult.recommendedAction}
                    </p>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 1rem' }}>
                  Click "Auto-Classify & Route" to analyze and categorize.
                </p>
              )}
            </Card.Content>
          </Card>
        </div>
      ),
    },
    {
      label: 'Recommendations Engine',
      icon: Lightbulb,
      content: (
        <Card>
          <Card.Header>
            <div>
              <Card.Title>Personalized System Recommendations</Card.Title>
              <Card.Description>AI-driven productivity and security insights based on live workspace telemetry</Card.Description>
            </div>
            <Button variant="primary" size="sm" icon={Sparkles} onClick={handleGetRecs} loading={loadingRecs}>
              Generate Insights
            </Button>
          </Card.Header>

          <Card.Content>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(recs || [
                {
                  id: '1',
                  title: 'Complete Pending Milestone Tasks',
                  description: 'Prioritize 3 high-priority tasks due this week to improve team sprint velocity.',
                  impact: 'High',
                  category: 'Productivity',
                },
                {
                  id: '2',
                  title: 'Review System Audit Logs',
                  description: 'Role-based access monitoring detected 12 recent permission verification checks.',
                  impact: 'Medium',
                  category: 'Security',
                },
              ]).map((r) => (
                <div
                  key={r.id || r.title}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700 }}>{r.title}</span>
                      <Badge variant={r.impact === 'High' ? 'danger' : 'info'}>{r.impact} Impact</Badge>
                    </div>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {r.description}
                    </p>
                  </div>
                  <Badge variant="primary">{r.category}</Badge>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="AI Assistant & Intelligence Hub"
        subtitle="Turnkey AI workflows for summarization, entity categorization, automated recommendations, and chatbot interaction."
        breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'AI Hub' }]}
      />

      <Tabs tabs={tabs} defaultActiveTab={0} />
    </DashboardLayout>
  );
};

export default AiAssistant;
