import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { useGroups } from '../context/GroupContext';

const CreateGroupModal = ({ onClose, onCreated }) => {
  const { createGroup } = useGroups();
  const [form, setForm] = useState({
    name: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast.error('Please enter a group name');
      return;
    }

    setSaving(true);
    try {
      await createGroup(form);
      toast.success('Group created successfully');
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create group');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop-dark"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-group-title"
    >
      <div className="modal-panel">
        {/* Header */}
        <div className="modal-panel-header">
          <h2 className="modal-panel-title" id="create-group-title">Create New Group</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <IoClose size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-form-grid">
            
            <div className="modal-form-field full-width">
              <label className="modal-label" htmlFor="group-name">Group Name *</label>
              <input
                id="group-name"
                name="name"
                type="text"
                className="modal-input"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Flat 202, Trip to Goa"
                required
              />
            </div>

            <div className="modal-form-field full-width">
              <label className="modal-label" htmlFor="group-desc">Description</label>
              <textarea
                id="group-desc"
                name="description"
                className="modal-textarea"
                value={form.description}
                onChange={handleChange}
                placeholder="What's this group for?"
                style={{ minHeight: '80px' }}
              />
            </div>

          </div>

          {/* About Groups Info Box */}
          <div className="settings-info-box">
            <h4 className="settings-info-title">About Groups</h4>
            <p className="settings-info-desc">
              Groups let you split bills and track shared expenses with friends, roommates, or family.
            </p>
            <ul className="settings-info-list">
              <li className="settings-info-list-item">Create a group and add members</li>
              <li className="settings-info-list-item">Add bills and choose how to split them</li>
              <li className="settings-info-list-item">Track who has paid their share</li>
              <li className="settings-info-list-item">Each member's share is auto-added to their tracker</li>
            </ul>
          </div>

          <div className="modal-footer" style={{ marginTop: '24px' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-dark"
              disabled={saving}
            >
              {saving ? 'Creating…' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
