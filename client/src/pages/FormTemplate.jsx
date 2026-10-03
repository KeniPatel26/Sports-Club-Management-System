import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import {
  FileText,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import FileUpload from '../components/common/FileUpload';
import { isValidEmail } from '../utils/validators';

export const FormTemplate = () => {
  const { toastSuccess, toastError, toastInfo } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'medium',
    emailContact: '',
    budget: '',
    deadline: '',
    tags: ['mern', 'starter'],
    uploadedFileUrl: '',
  });

  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Project title is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (formData.emailContact && !isValidEmail(formData.emailContact)) {
      errs.emailContact = 'Please enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      category: 'General',
      priority: 'medium',
      emailContact: '',
      budget: '',
      deadline: '',
      tags: [],
      uploadedFileUrl: '',
    });
    setErrors({});
    toastInfo('Form reset to default');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toastError('Please fix validation errors before submitting.');
      return;
    }

    try {
      setLoading(true);
      // Simulate API submission delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      toastSuccess('Form submitted and validated successfully!');
    } catch (err) {
      toastError('Form submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Comprehensive Form Template"
        subtitle="Reusable multi-section form blueprint with field validation, dynamic tag arrays, and file upload."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Form Template' },
        ]}
      />

      <form onSubmit={handleSubmit} style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section 1: Basic Information */}
          <Card>
            <Card.Header>
              <div>
                <Card.Title>1. General Information</Card.Title>
                <Card.Description>Enter primary titles and category classifications</Card.Description>
              </div>
            </Card.Header>

            <Card.Content>
              <Input
                label="Resource Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Healthcare Automation Pipeline"
                error={errors.title}
                required
              />

              <Textarea
                label="Detailed Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain the scope, objectives, and deliverables..."
                error={errors.description}
                rows={4}
                required
              />

              <div className="grid-cols-2">
                <Select
                  label="Category Classification"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  options={['General', 'Artificial Intelligence', 'Fintech', 'Healthcare', 'Logistics', 'Education']}
                  placeholder=""
                />

                <Select
                  label="Urgency / Priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' },
                  ]}
                  placeholder=""
                />
              </div>
            </Card.Content>
          </Card>

          {/* Section 2: Financials & Timeline */}
          <Card>
            <Card.Header>
              <div>
                <Card.Title>2. Metrics & Contacts</Card.Title>
                <Card.Description>Set budget allocations, timeline deadlines, and contact email</Card.Description>
              </div>
            </Card.Header>

            <Card.Content>
              <div className="grid-cols-3">
                <Input
                  label="Budget Allocation ($)"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="e.g. 25000"
                />

                <Input
                  label="Target Deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />

                <Input
                  label="Contact Email"
                  type="email"
                  value={formData.emailContact}
                  onChange={(e) => setFormData({ ...formData, emailContact: e.target.value })}
                  placeholder="e.g. lead@demo.com"
                  error={errors.emailContact}
                />
              </div>

              {/* Dynamic Tags */}
              <div style={{ marginTop: '1rem' }}>
                <label className="form-label">Resource Tags & Keywords</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    style={{ marginBottom: 0, flex: 1 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button variant="secondary" onClick={handleAddTag} icon={Plus}>
                    Add
                  </Button>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '0.8rem',
                        }}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Section 3: File Attachment Upload */}
          <Card>
            <Card.Header>
              <div>
                <Card.Title>3. Document & Media Attachment</Card.Title>
                <Card.Description>Attach files, spreadsheets, or images</Card.Description>
              </div>
            </Card.Header>

            <Card.Content>
              <FileUpload
                onUploadSuccess={(fileData) => {
                  setFormData((prev) => ({ ...prev, uploadedFileUrl: fileData.url }));
                }}
              />
            </Card.Content>
          </Card>

          {/* Form Action Controls */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
            <Button variant="outline" icon={RotateCcw} onClick={handleReset}>
              Reset Form
            </Button>
            <Button type="submit" variant="primary" icon={Save} loading={loading}>
              Save & Submit
            </Button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default FormTemplate;
