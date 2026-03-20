import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, Alert, ListGroup, InputGroup, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroups } from '../context/GroupContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaReceipt, FaArrowLeft, FaEquals, FaUserEdit } from 'react-icons/fa';

const CreateBill = () => {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const { groups, fetchGroups, createBill } = useGroups();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    paidBy: '',
    group: groupId,
    splitType: 'equal',
    shares: []
  });
  
  // Find the current group from the groups array
  const group = groups.find(g => g._id === groupId);
  
  useEffect(() => {
    if (groupId) {
      fetchGroups();
    }
  }, [groupId, fetchGroups]);
  
  useEffect(() => {
    // Set the current user as the payer by default
    if (user) {
      setFormData(prev => ({
        ...prev,
        paidBy: user._id
      }));
    }
  }, [user]);
  
  useEffect(() => {
    // Initialize shares when group data is available
    if (group && group.members) {
      const equalShare = formData.amount ? parseFloat(formData.amount) / group.members.length : 0;
      
      const initialShares = group.members.map(member => ({
        user: member._id,
        amount: equalShare ? parseFloat(equalShare.toFixed(2)) : 0
      }));
      
      setFormData(prev => ({
        ...prev,
        shares: initialShares
      }));
    }
  }, [group, formData.amount, formData.splitType]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Recalculate shares if amount or splitType changes
    if (name === 'amount' || name === 'splitType') {
      if (name === 'amount' && formData.splitType === 'equal' && group) {
        const equalShare = parseFloat(value) / group.members.length;
        
        const updatedShares = group.members.map(member => ({
          user: member._id,
          amount: equalShare ? parseFloat(equalShare.toFixed(2)) : 0
        }));
        
        setFormData(prev => ({
          ...prev,
          shares: updatedShares
        }));
      }
    }
  };
  
  const handleShareChange = (userId, value) => {
    const updatedShares = formData.shares.map(share => 
      share.user === userId 
        ? { ...share, amount: parseFloat(value) || 0 } 
        : share
    );
    
    setFormData(prev => ({
      ...prev,
      shares: updatedShares
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate total shares equals bill amount for custom split
    if (formData.splitType === 'custom') {
      const totalShares = formData.shares.reduce((sum, share) => sum + share.amount, 0);
      const billAmount = parseFloat(formData.amount);
      
      if (Math.abs(totalShares - billAmount) > 0.01) {
        setError(`The sum of all shares (${totalShares.toFixed(2)}) must equal the total bill amount (${billAmount.toFixed(2)})`);
        setLoading(false);
        return;
      }
    }
    
    try {
      await createBill(formData);
      navigate(`/groups/${groupId}`);
    } catch (err) {
      setError(err.message || 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };
  
  if (!group) {
    return (
      <Container className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }
  
  // Calculate the remaining amount for custom split
  const totalCustomShares = formData.shares.reduce((sum, share) => sum + share.amount, 0);
  const remainingAmount = formData.amount ? parseFloat(formData.amount) - totalCustomShares : 0;
  
  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <Button 
            variant={darkMode ? "outline-light" : "outline-secondary"} 
            className="mb-3"
            onClick={() => navigate(`/groups/${groupId}`)}
          >
            <FaArrowLeft className="me-1" /> Back to Group
          </Button>
          <h1>
            <FaReceipt className="me-2" />
            Add New Bill
          </h1>
          <p className="text-muted">
            Add a bill to split expenses with members of <strong>{group.name}</strong>.
          </p>
        </Col>
      </Row>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      <Row>
        <Col lg={8}>
          <Card className={`shadow-sm ${darkMode ? 'bg-dark text-white' : ''}`}>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Bill Title*</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter bill title"
                        required
                        className={darkMode ? 'bg-dark text-white border-secondary' : ''}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Amount*</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className={darkMode ? 'bg-dark text-white border-secondary' : ''}>$</InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0.01"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          placeholder="0.00"
                          required
                          className={darkMode ? 'bg-dark text-white border-secondary' : ''}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category*</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className={darkMode ? 'bg-dark text-white border-secondary' : ''}
                      >
                        <option value="">Select a category</option>
                        <option value="Food">Food</option>
                        <option value="Groceries">Groceries</option>
                        <option value="Rent">Rent</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Travel">Travel</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Health">Health</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date*</Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className={darkMode ? 'bg-dark text-white border-secondary' : ''}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Paid By*</Form.Label>
                      <Form.Select
                        name="paidBy"
                        value={formData.paidBy}
                        onChange={handleChange}
                        required
                        className={darkMode ? 'bg-dark text-white border-secondary' : ''}
                      >
                        <option value="">Select who paid</option>
                        {group.members.map(member => (
                          <option key={member._id} value={member._id}>
                            {member.first_name} {member.last_name} {member._id === user._id ? '(You)' : ''}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Split Type*</Form.Label>
                      <div className="d-flex">
                        <Form.Check
                          type="radio"
                          id="split-equal"
                          label="Equal Split"
                          name="splitType"
                          value="equal"
                          checked={formData.splitType === 'equal'}
                          onChange={handleChange}
                          className="me-3"
                        />
                        <Form.Check
                          type="radio"
                          id="split-custom"
                          label="Custom Split"
                          name="splitType"
                          value="custom"
                          checked={formData.splitType === 'custom'}
                          onChange={handleChange}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter bill description (optional)"
                    className={darkMode ? 'bg-dark text-white border-secondary' : ''}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>
                    {formData.splitType === 'equal' ? (
                      <div className="d-flex align-items-center">
                        <FaEquals className="me-1" /> Equal Shares
                      </div>
                    ) : (
                      <div className="d-flex align-items-center">
                        <FaUserEdit className="me-1" /> Custom Shares
                        {remainingAmount !== 0 && (
                          <Badge 
                            bg={remainingAmount < 0 ? "danger" : "warning"} 
                            className="ms-2"
                            pill
                          >
                            {remainingAmount < 0 ? 'Over-allocated' : 'Under-allocated'}: ${Math.abs(remainingAmount).toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    )}
                  </Form.Label>
                  <ListGroup className="mb-3">
                    {formData.shares.map((share, index) => {
                      const member = group.members.find(m => m._id === share.user);
                      return (
                        <ListGroup.Item 
                          key={share.user} 
                          className={`d-flex justify-content-between align-items-center ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                        >
                          <div>
                            {member.first_name} {member.last_name}
                            {member._id === user._id && (
                              <span className="ms-1">(You)</span>
                            )}
                          </div>
                          {formData.splitType === 'equal' ? (
                            <div>${share.amount.toFixed(2)}</div>
                          ) : (
                            <InputGroup className="w-auto">
                              <InputGroup.Text className={darkMode ? 'bg-dark text-white border-secondary' : ''}>$</InputGroup.Text>
                              <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                value={share.amount}
                                onChange={(e) => handleShareChange(share.user, e.target.value)}
                                style={{ width: '100px' }}
                                className={darkMode ? 'bg-dark text-white border-secondary' : ''}
                              />
                            </InputGroup>
                          )}
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                </Form.Group>
                
                <div className="d-flex justify-content-end">
                  <Button 
                    variant="secondary" 
                    className="me-2"
                    onClick={() => navigate(`/groups/${groupId}`)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={loading || (formData.splitType === 'custom' && Math.abs(remainingAmount) > 0.01)}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        Creating...
                      </>
                    ) : (
                      'Create Bill'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} className="mt-4 mt-lg-0">
          <Card className={`shadow-sm ${darkMode ? 'bg-dark text-white' : ''}`}>
            <Card.Body>
              <h5>About Bill Splitting</h5>
              <p>
                When you create a bill, each member's share will be automatically added to their expense tracker.
              </p>
              <h6>Split Types:</h6>
              <ul>
                <li>
                  <strong>Equal Split:</strong> The bill amount is divided equally among all group members.
                </li>
                <li>
                  <strong>Custom Split:</strong> You can specify how much each person should pay.
                </li>
              </ul>
              <p className="mb-0 text-muted small">
                Note: The person who paid the bill will have the full amount added to their expenses, and others will have their share added.
              </p>
            </Card.Body>
          </Card>
          
          <Card className={`shadow-sm mt-4 ${darkMode ? 'bg-dark text-white' : ''}`}>
            <Card.Body>
              <h5>Group Members</h5>
              <ListGroup variant={darkMode ? 'dark' : 'flush'}>
                {group.members.map(member => (
                  <ListGroup.Item 
                    key={member._id} 
                    className={darkMode ? 'bg-dark text-white border-secondary' : ''}
                  >
                    {member.first_name} {member.last_name}
                    {member._id === user._id && (
                      <span className="ms-1 text-muted">(You)</span>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateBill;
