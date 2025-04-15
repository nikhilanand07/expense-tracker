import React, { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { currencies } from '../utils/currencyUtils';
import { toast } from 'react-toastify';

const CurrencySelector = () => {
  const { user, updateCurrency } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || 'USD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => {
    setSelectedCurrency(user?.currency || 'USD');
    setShowModal(true);
  };

  const handleChange = (e) => {
    setSelectedCurrency(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await updateCurrency(selectedCurrency);
      
      if (result.success) {
        toast.success('Currency updated successfully');
        handleClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update currency');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find current currency details
  const currentCurrency = currencies.find(c => c.code === user?.currency) || currencies[0];

  return (
    <>
      <Button 
        variant="outline-secondary" 
        size="sm" 
        onClick={handleShow}
        className="d-flex align-items-center"
      >
        <span className="me-1">{currentCurrency.symbol}</span>
        {currentCurrency.code}
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Change Currency</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="currency">
              <Form.Label>Select Currency</Form.Label>
              <Form.Select
                value={selectedCurrency}
                onChange={handleChange}
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button 
                variant="secondary" 
                onClick={handleClose} 
                className="me-2"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Currency'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CurrencySelector;
