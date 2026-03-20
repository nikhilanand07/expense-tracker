import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useGroups } from '../context/GroupContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaUsers, FaArrowLeft } from 'react-icons/fa';

const CreateGroup = () => {
  const { createGroup } = useGroups();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('Current user:', user);
      
      const newGroup = await createGroup(formData);
      navigate(`/groups/${newGroup._id}`);
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <Button 
            variant={darkMode ? "outline-light" : "outline-secondary"} 
            className="mb-3"
            onClick={() => navigate('/groups')}
          >
            <FaArrowLeft className="me-1" /> Back to Groups
          </Button>
          <h1>
            <FaUsers className="me-2" />
            Create New Group
          </h1>
          <p className="text-muted">
            Create a group to start splitting bills with friends.
          </p>
        </Col>
      </Row>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Row>
        <Col md={8} lg={6}>
          <Card className={`shadow-sm ${darkMode ? 'bg-dark text-white' : ''}`}>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Group Name*</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter group name"
                    required
                    className={darkMode ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter group description (optional)"
                    className={darkMode ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-end">
                  <Button 
                    variant="secondary" 
                    className="me-2"
                    onClick={() => navigate('/groups')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        Creating...
                      </>
                    ) : (
                      'Create Group'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={6} className="mt-4 mt-md-0">
          <Card className={`shadow-sm ${darkMode ? 'bg-dark text-white' : ''}`}>
            <Card.Body>
              <h5>About Groups</h5>
              <p>
                Groups allow you to split bills and track shared expenses with friends, roommates, or family members.
              </p>
              <h6>How it works:</h6>
              <ol>
                <li>Create a group and add members</li>
                <li>Add bills and choose how to split them</li>
                <li>Track who has paid their share</li>
                <li>Each member's share is automatically added to their expense tracker</li>
              </ol>
              <p className="mb-0 text-muted small">
                Note: You can add members to your group after creation.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateGroup;
