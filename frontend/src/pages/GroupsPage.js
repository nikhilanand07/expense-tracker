import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useGroups } from '../context/GroupContext';
import { useTheme } from '../context/ThemeContext';
import { FaUsers, FaPlus, FaUserFriends } from 'react-icons/fa';

const GroupsPage = () => {
  const { groups, loading, error, fetchGroups } = useGroups();
  const { darkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
  };

  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="mb-0">
            <FaUsers className="me-2" />
            My Groups
          </h1>
          <p className="text-muted mt-2">
            Create groups, split bills, and track shared expenses with friends.
          </p>
        </Col>
        <Col xs="auto" className="d-flex">
          <Button 
            variant={darkMode ? "outline-light" : "outline-secondary"} 
            className="me-2"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Spinner animation="border" size="sm" />
            ) : (
              'Refresh'
            )}
          </Button>
          <Button 
            as={Link} 
            to="/groups/create" 
            variant={darkMode ? "primary" : "primary"}
            className="d-flex align-items-center"
          >
            <FaPlus className="me-1" /> New Group
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {loading && !refreshing ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : groups.length === 0 ? (
        <Card className={`shadow-sm ${darkMode ? 'bg-dark text-white' : ''}`}>
          <Card.Body className="text-center py-5">
            <FaUserFriends size={48} className="mb-3 text-muted" />
            <h3>No Groups Yet</h3>
            <p className="text-muted">
              Create a group to start splitting bills with friends.
            </p>
            <Button 
              as={Link} 
              to="/groups/create" 
              variant="primary"
              className="mt-2"
            >
              <FaPlus className="me-1" /> Create First Group
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {groups.map(group => (
            <Col key={group._id}>
              <Card 
                as={Link} 
                to={`/groups/${group._id}`} 
                className={`h-100 shadow-sm group-card ${darkMode ? 'bg-dark text-white' : ''}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="group-icon">
                      <FaUsers size={24} className={darkMode ? 'text-info' : 'text-primary'} />
                    </div>
                    <span className="badge bg-info rounded-pill">
                      {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                  <Card.Title>{group.name}</Card.Title>
                  {group.description && (
                    <Card.Text className="text-muted small">
                      {group.description.length > 100 
                        ? `${group.description.substring(0, 100)}...` 
                        : group.description}
                    </Card.Text>
                  )}
                </Card.Body>
                <Card.Footer className={`small ${darkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Created: {new Date(group.createdAt).toLocaleDateString()}</span>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className={darkMode ? 'text-info' : 'text-primary'}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/groups/${group._id}`;
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default GroupsPage;
