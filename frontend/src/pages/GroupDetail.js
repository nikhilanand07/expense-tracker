import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Tab, Nav, Badge, ListGroup, Modal, Form } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGroups } from '../context/GroupContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaUsers, FaArrowLeft, FaPlus, FaUserPlus, FaReceipt, FaCheck, FaTrash } from 'react-icons/fa';
import { formatAmount } from '../utils/currencyUtils';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const { 
    groups, 
    bills, 
    loading, 
    error, 
    fetchGroups, 
    fetchGroupBills, 
    addMember, 
    removeMember,
    markShareAsPaid
  } = useGroups();
  
  const [activeTab, setActiveTab] = useState('details');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState(null);
  const [removingMember, setRemovingMember] = useState(null);
  const [markingPaid, setMarkingPaid] = useState(null);
  const [filterMyBills, setFilterMyBills] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  
  // Find the current group from the groups array
  const group = groups.find(g => g._id === id);
  
  useEffect(() => {
    if (id) {
      fetchGroups();
      fetchGroupBills(id);
    }
  }, [id, fetchGroups, fetchGroupBills]);
  
  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    setAddMemberError(null);
    
    try {
      await addMember(id, memberEmail);
      setMemberEmail('');
      setShowAddMemberModal(false);
    } catch (err) {
      setAddMemberError(err.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };
  
  const handleRemoveMember = async (userId) => {
    setRemovingMember(userId);
    
    try {
      await removeMember(id, userId);
    } catch (err) {
      console.error('Failed to remove member:', err);
    } finally {
      setRemovingMember(null);
    }
  };
  
  const handleMarkAsPaid = async (billId, shareId) => {
    setMarkingPaid(`${billId}-${shareId}`);
    
    try {
      await markShareAsPaid(billId, shareId);
    } catch (err) {
      console.error('Failed to mark share as paid:', err);
    } finally {
      setMarkingPaid(null);
    }
  };

  const handleBulkSettle = async (userId) => {
    setMarkingPaid(`bulk-${userId}`);
    
    try {
      for (const bill of bills) {
        const isPayer = bill.paidBy._id === currentUserId;
        const targetIsPayer = bill.paidBy._id === userId;
        
        if (isPayer || targetIsPayer) {
          for (const share of bill.shares) {
            if (!share.paid) {
               const shareUserId = share.user._id || share.user;
               if ((isPayer && shareUserId === userId) || (targetIsPayer && shareUserId === currentUserId)) {
                 await markShareAsPaid(bill._id, share._id);
               }
            }
          }
        }
      }
      await fetchGroupBills(id);
    } catch (err) {
      console.error('Failed to settle up:', err);
    } finally {
      setMarkingPaid(null);
    }
  };
  
  // Determine current user ID securely (handles both _id and id)
  const currentUserId = user ? (user._id || user.id) : null;
  
  const hasUnsettledBills = (memberId) => {
    return bills.some(bill => {
      const payerId = bill.paidBy._id || bill.paidBy;
      if (payerId === memberId) {
        return bill.shares.some(share => !share.paid && (share.user._id || share.user) !== memberId);
      }
      return bill.shares.some(share => (share.user._id || share.user) === memberId && !share.paid);
    });
  };

  const confirmRemoveMember = (member) => {
    setMemberToRemove(member);
    setShowRemoveMemberModal(true);
  };
  
  const proceedRemoveMember = async () => {
    if (!memberToRemove) return;
    await handleRemoveMember(memberToRemove._id);
    setShowRemoveMemberModal(false);
    setMemberToRemove(null);
  };

  // Calculate balances
  let youOwe = 0;
  let owedToYou = 0;
  let pairwiseBalances = {};
  
  if (currentUserId && bills && bills.length > 0) {
    let netBalance = 0;
    group?.members.forEach(m => pairwiseBalances[m._id] = 0);
    
    bills.forEach(bill => {
      const isPayer = bill.paidBy._id === currentUserId;
      const payerId = bill.paidBy._id;
      
      bill.shares.forEach(share => {
        if (!share.paid) {
          const shareUserId = share.user._id || share.user;
          if (isPayer && shareUserId !== currentUserId) {
            netBalance += share.amount; // Someone owes you
            pairwiseBalances[shareUserId] = (pairwiseBalances[shareUserId] || 0) + share.amount;
          } else if (!isPayer && shareUserId === currentUserId) {
            netBalance -= share.amount; // You owe someone
            pairwiseBalances[payerId] = (pairwiseBalances[payerId] || 0) - share.amount;
          }
        }
      });
    });
    
    if (netBalance > 0) {
      owedToYou = netBalance;
    } else if (netBalance < 0) {
      youOwe = Math.abs(netBalance);
    }
  }
  
  // Check if the current user is the creator of the group
  const isCreator = group && currentUserId && group.creator === currentUserId;
  
  if (loading && !group) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Button 
          variant={darkMode ? "outline-light" : "outline-secondary"} 
          onClick={() => navigate('/groups')}
        >
          <FaArrowLeft className="me-1" /> Back to Groups
        </Button>
      </Container>
    );
  }
  
  if (!group) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Group not found</Alert>
        <Button 
          variant={darkMode ? "outline-light" : "outline-secondary"} 
          onClick={() => navigate('/groups')}
        >
          <FaArrowLeft className="me-1" /> Back to Groups
        </Button>
      </Container>
    );
  }
  const displayBills = filterMyBills 
    ? bills.filter(b => b.paidBy._id === currentUserId || b.shares.some(s => s.user._id === currentUserId))
    : bills;

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
            {group.name}
          </h1>
          {group.description && (
            <p className="text-muted">{group.description}</p>
          )}
        </Col>
        <Col xs="auto" className="d-flex align-items-start">
          <Button 
            as={Link} 
            to={`/groups/${id}/create-bill`} 
            variant="primary"
            className="d-flex align-items-center"
          >
            <FaPlus className="me-1" /> Add Bill
          </Button>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={12}>
          {youOwe > 0 ? (
            <Card className={`shadow-sm ${darkMode ? 'bg-danger text-light' : 'bg-danger text-white'}`} style={{ opacity: 0.9 }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0 text-white-50">You Owe Overall</h6>
                    <h3 className="mb-0 text-white">{formatAmount(youOwe, user?.currency)}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ) : owedToYou > 0 ? (
            <Card className={`shadow-sm ${darkMode ? 'bg-success text-light' : 'bg-success text-white'}`} style={{ opacity: 0.9 }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0 text-white-50">Others Owe You Overall</h6>
                    <h3 className="mb-0 text-white">{formatAmount(owedToYou, user?.currency)}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Card className={`shadow-sm ${darkMode ? 'bg-secondary text-light' : 'bg-secondary text-white'}`} style={{ opacity: 0.9 }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0 text-white-50">Your Balance</h6>
                    <h3 className="mb-0 text-white">Settled Up</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
      
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Row>
          <Col sm={12}>
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link 
                  eventKey="details" 
                  className={darkMode ? (activeTab === 'details' ? 'bg-dark text-white border-secondary border-bottom-0' : 'text-light') : ''}
                >
                  Group Details
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  eventKey="bills" 
                  className={darkMode ? (activeTab === 'bills' ? 'bg-dark text-white border-secondary border-bottom-0' : 'text-light') : ''}
                >
                  Bills
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  eventKey="members" 
                  className={darkMode ? (activeTab === 'members' ? 'bg-dark text-white border-secondary border-bottom-0' : 'text-light') : ''}
                >
                  Members <Badge bg="info" pill>{group.members.length}</Badge>
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>
        
        <Tab.Content>
          <Tab.Pane eventKey="details">
            <Row>
              <Col md={6}>
                <Card className={`shadow-sm ${darkMode ? 'bg-dark text-white' : ''}`}>
                  <Card.Body>
                    <h5>Group Information</h5>
                    <ListGroup variant={darkMode ? 'dark' : 'flush'}>
                      <ListGroup.Item className={darkMode ? 'bg-dark text-white border-secondary' : ''}>
                        <strong>Created:</strong> {new Date(group.createdAt).toLocaleDateString()}
                      </ListGroup.Item>
                      <ListGroup.Item className={darkMode ? 'bg-dark text-white border-secondary' : ''}>
                        <strong>Members:</strong> {group.members.length}
                      </ListGroup.Item>
                      <ListGroup.Item className={darkMode ? 'bg-dark text-white border-secondary' : ''}>
                        <strong>Total Bills:</strong> {bills.length}
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6} className="mt-4 mt-md-0">
                <Card className={`shadow-sm ${darkMode ? 'bg-dark text-white' : ''}`}>
                  <Card.Body>
                    <h5>Quick Actions</h5>
                    <div className="d-grid gap-2">
                      <Button 
                        as={Link} 
                        to={`/groups/${id}/create-bill`} 
                        variant="primary"
                        className="d-flex align-items-center justify-content-center"
                      >
                        <FaPlus className="me-1" /> Add New Bill
                      </Button>
                      <Button 
                        variant="outline-primary"
                        className="d-flex align-items-center justify-content-center"
                        onClick={() => setShowAddMemberModal(true)}
                      >
                        <FaUserPlus className="me-1" /> Add Member
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>
          
          <Tab.Pane eventKey="bills">
            <div className={`d-flex justify-content-between align-items-center mb-3 p-3 rounded shadow-sm ${darkMode ? 'bg-dark border border-secondary' : 'bg-white border'}`}>
               <h5 className="mb-0">Group Bills</h5>
               <Form.Check 
                 type="switch"
                 id="my-bills-switch"
                 label="My Bills Only"
                 checked={filterMyBills}
                 onChange={(e) => setFilterMyBills(e.target.checked)}
                 className={darkMode ? 'text-white' : ''}
               />
            </div>
            {displayBills.length === 0 ? (
              <Card className={`shadow-sm ${darkMode ? 'bg-dark text-white' : ''}`}>
                <Card.Body className="text-center py-5">
                  <FaReceipt size={48} className="mb-3 text-muted" />
                  <h3>No Bills Yet</h3>
                  <p className="text-muted">
                    {filterMyBills ? "You are not involved in any bills in this group." : "Add a bill to start splitting expenses with group members."}
                  </p>
                  <Button 
                    as={Link} 
                    to={`/groups/${id}/create-bill`} 
                    variant="primary"
                    className="mt-2"
                  >
                    <FaPlus className="me-1" /> Add Bill
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <div className="bills-list">
                {displayBills.map(bill => (
                  <Card key={bill._id} className={`mb-3 shadow-sm ${darkMode ? 'bg-dark text-white' : ''}`}>
                    <Card.Header className={`d-flex justify-content-between align-items-center ${darkMode ? 'bg-dark border-secondary' : ''}`}>
                      <h5 className="mb-0">{bill.title}</h5>
                      <Badge bg="primary" pill>
                        {bill.splitType === 'equal' ? 'Equal Split' : 'Custom Split'}
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <p className="mb-1">
                            <strong>Amount:</strong> {formatAmount(bill.amount, user?.currency)}
                          </p>
                          <p className="mb-1">
                            <strong>Category:</strong> {bill.category}
                          </p>
                          <p className="mb-1">
                            <strong>Date:</strong> {new Date(bill.date).toLocaleDateString()}
                          </p>
                          <p className="mb-1">
                            <strong>Paid By:</strong> {bill.paidBy.first_name} {bill.paidBy.last_name}
                          </p>
                          {bill.description && (
                            <p className="mb-1">
                              <strong>Description:</strong> {bill.description}
                            </p>
                          )}
                        </Col>
                        <Col md={6}>
                          <h6>Shares</h6>
                          <ListGroup variant={darkMode ? 'dark' : 'flush'}>
                            {bill.shares.map(share => (
                              <ListGroup.Item 
                                key={share._id} 
                                className={`d-flex justify-content-between align-items-center ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                              >
                                <div>
                                  {share.user.first_name} {share.user.last_name}
                                  <span className="ms-2 text-muted small">
                                    ({formatAmount(share.amount, user?.currency)})
                                  </span>
                                </div>
                                {share.paid ? (
                                  <Badge bg="success" pill>Paid</Badge>
                                ) : share.user._id === currentUserId ? (
                                  <Badge bg="warning" text="dark" pill>You Owe</Badge>
                                ) : bill.paidBy._id === currentUserId ? (
                                  <Button 
                                    size="sm" 
                                    variant="outline-success"
                                    disabled={markingPaid === `${bill._id}-${share._id}`}
                                    onClick={() => handleMarkAsPaid(bill._id, share._id)}
                                  >
                                    {markingPaid === `${bill._id}-${share._id}` ? (
                                      <Spinner animation="border" size="sm" />
                                    ) : (
                                      <>
                                        <FaCheck className="me-1" /> Mark Paid
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <Badge bg="danger" pill>Unpaid</Badge>
                                )}
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Tab.Pane>
          
          <Tab.Pane eventKey="members">
            <Card className={`shadow-sm ${darkMode ? 'bg-dark text-white' : ''}`}>
              <Card.Header className={`d-flex justify-content-between align-items-center ${darkMode ? 'bg-dark border-secondary' : ''}`}>
                <h5 className="mb-0">Group Members</h5>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowAddMemberModal(true)}
                >
                  <FaUserPlus className="me-1" /> Add Member
                </Button>
              </Card.Header>
              <ListGroup variant={darkMode ? 'dark' : 'flush'}>
                {group.members.map(member => (
                  <ListGroup.Item 
                    key={member._id} 
                    className={`d-flex flex-wrap justify-content-between align-items-center gap-2 ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
                  >
                    <div>
                      {member.first_name} {member.last_name}
                      <span className="ms-2 text-muted small">
                        ({member.email})
                      </span>
                      {member._id === currentUserId && (
                        <Badge bg="info" className="ms-2" pill>You</Badge>
                      )}
                      {group.creator === member._id && (
                        <Badge bg="primary" className="ms-2" pill>Creator</Badge>
                      )}
                    </div>
                    
                    <div className="d-flex align-items-center">
                      {member._id !== currentUserId && pairwiseBalances[member._id] !== undefined && pairwiseBalances[member._id] !== 0 && (
                        <div className="me-3 d-flex align-items-center">
                          {pairwiseBalances[member._id] > 0 ? (
                            <Badge bg="success" pill className="me-2">Owes You {formatAmount(pairwiseBalances[member._id], user?.currency)}</Badge>
                          ) : (
                            <Badge bg="danger" pill className="me-2">You Owe {formatAmount(Math.abs(pairwiseBalances[member._id]), user?.currency)}</Badge>
                          )}
                          
                          {pairwiseBalances[member._id] > 0 && (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              disabled={markingPaid === `bulk-${member._id}`}
                              onClick={() => handleBulkSettle(member._id)}
                            >
                              {markingPaid === `bulk-${member._id}` ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                'Settle Up'
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {isCreator && member._id !== currentUserId && (
                        <div title={hasUnsettledBills(member._id) ? "Cannot remove member with unsettled balances" : ""}>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            disabled={removingMember === member._id || hasUnsettledBills(member._id)}
                            onClick={() => confirmRemoveMember(member)}
                            className={hasUnsettledBills(member._id) ? "opacity-50" : ""}
                            style={hasUnsettledBills(member._id) ? { pointerEvents: "none" } : {}}
                          >
                            {removingMember === member._id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <FaTrash />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
      
      {/* Add Member Modal */}
      <Modal 
        show={showAddMemberModal} 
        onHide={() => {
          setShowAddMemberModal(false);
          setAddMemberError(null);
          setMemberEmail('');
        }}
        centered
        className={darkMode ? 'dark-modal' : ''}
      >
        <Modal.Header closeButton className={darkMode ? 'bg-dark text-white border-secondary' : ''}>
          <Modal.Title>Add Member to Group</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? 'bg-dark text-white' : ''}>
          {addMemberError && (
            <Alert variant="danger">{addMemberError}</Alert>
          )}
          <Form onSubmit={handleAddMember}>
            <Form.Group className="mb-3">
              <Form.Label>Member Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email address"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                required
                className={darkMode ? 'bg-dark text-white border-secondary' : ''}
              />
              <Form.Text className={darkMode ? 'text-light' : 'text-muted'}>
                The user must have an account in the system.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className={darkMode ? 'bg-dark text-white border-secondary' : ''}>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowAddMemberModal(false);
              setAddMemberError(null);
              setMemberEmail('');
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddMember}
            disabled={addingMember || !memberEmail}
          >
            {addingMember ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Adding...
              </>
            ) : (
              'Add Member'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Remove Member Confirmation Modal */}
      <Modal 
        show={showRemoveMemberModal} 
        onHide={() => setShowRemoveMemberModal(false)}
        centered
        className={darkMode ? 'dark-modal' : ''}
      >
        <Modal.Header closeButton className={darkMode ? 'bg-dark text-white border-secondary' : ''}>
          <Modal.Title>Confirm Removal</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? 'bg-dark text-white' : ''}>
          <p>
            Are you sure you want to remove <strong>{memberToRemove?.first_name} {memberToRemove?.last_name}</strong> from this group?
          </p>
          <p className="text-muted small">
            This action cannot be undone. Only members without unsettled balances can be removed.
          </p>
        </Modal.Body>
        <Modal.Footer className={darkMode ? 'bg-dark text-white border-secondary' : ''}>
          <Button variant="secondary" onClick={() => setShowRemoveMemberModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={proceedRemoveMember}
            disabled={removingMember === memberToRemove?._id}
          >
            {removingMember === memberToRemove?._id ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Removing...
              </>
            ) : (
              'Remove Member'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GroupDetail;
