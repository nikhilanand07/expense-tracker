import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGroups } from '../context/GroupContext';
import { FaUsers, FaPlus, FaArrowRight } from 'react-icons/fa';
import CreateGroupModal from '../components/CreateGroupModal';

const GROUP_THEME_COLORS = [
  { border: '#8b5cf6', badgeBg: 'rgba(139,92,246,0.15)', badgeText: '#a78bfa' },
  { border: '#06b6d4', badgeBg: 'rgba(6,182,212,0.15)', badgeText: '#67e8f9' },
  { border: '#f59e0b', badgeBg: 'rgba(245,158,11,0.15)', badgeText: '#fcd34d' },
];

const GroupsPage = () => {
  const { groups, loading, error, fetchGroups } = useGroups();
  const [refreshing, setRefreshing] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
  };

  const getThemeColor = (index) => {
    return GROUP_THEME_COLORS[index % GROUP_THEME_COLORS.length];
  };

  return (
    <>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Groups</h1>
          <p className="page-subtitle">
            Create groups, split bills, and track shared expenses with friends.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-ghost"
            style={{ fontSize: '12px', padding: '8px 14px' }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button onClick={() => setIsCreatingGroup(true)} className="btn-primary-dark">
            <FaPlus size={12} /> New Group
          </button>
        </div>
      </div>

      {error && (
        <div className="empty-state" style={{ marginBottom: '24px', borderColor: 'var(--danger)' }}>
          <div className="empty-state-icon">⚠️</div>
          <div className="empty-state-text">{error}</div>
        </div>
      )}

      {loading && !refreshing ? (
        <div className="loading-center">
          <div className="spinner-dark" />
          Loading groups...
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map((group, index) => {
            const theme = getThemeColor(index);
            const memberCount = group.members?.length || 0;

            return (
              <Link
                key={group._id}
                to={`/groups/${group._id}`}
                className="group-card"
                style={{
                  borderTop: `2px solid ${theme.border}`,
                  animationDelay: `${index * 0.05}s`
                }}
              >
                <div className="group-card-top">
                  <div className="group-card-icon" style={{ background: theme.badgeBg, color: theme.badgeText }}>
                    <FaUsers size={20} />
                  </div>
                  <span
                    className="group-member-badge"
                    style={{ background: theme.badgeBg, color: theme.badgeText }}
                  >
                    {memberCount} {memberCount === 1 ? 'member' : 'members'}
                  </span>
                </div>

                <h3 className="group-card-name">{group.name}</h3>

                <p className="group-card-desc">
                  {group.description
                    ? group.description.length > 100
                      ? `${group.description.substring(0, 100)}...`
                      : group.description
                    : 'No description provided.'}
                </p>

                <div className="group-card-footer">
                  <span className="group-card-date">
                    Created: {new Date(group.createdAt).toLocaleDateString()}
                  </span>
                  <span className="group-card-link" style={{ color: theme.badgeText }}>
                    View Details <FaArrowRight size={10} />
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Dotted empty group creator button */}
          <button
            onClick={() => setIsCreatingGroup(true)}
            className="group-create-card"
            style={{ animationDelay: `${groups.length * 0.05}s`, width: '100%', background: 'transparent' }}
          >
            <div className="group-create-icon">
              <FaPlus />
            </div>
            <div className="group-create-text">Create a new group</div>
          </button>
        </div>
      )}

      {/* ── Create Group Modal ── */}
      {isCreatingGroup && (
        <CreateGroupModal
          onClose={() => setIsCreatingGroup(false)}
          onCreated={fetchGroups}
        />
      )}
    </>
  );
};

export default GroupsPage;
