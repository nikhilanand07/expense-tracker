import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import config from '../config';

const GroupContext = createContext();

export const useGroups = () => useContext(GroupContext);

export const GroupProvider = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const [groups, setGroups] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all groups for the current user
  const fetchGroups = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${config.apiUrl}/api/groups`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch groups');
      }
      
      setGroups(data.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Create a new group
  const createGroup = async (groupData) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Direct fetch approach to avoid issues with axios and user ID
      const response = await fetch(`${config.apiUrl}/api/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...groupData,
          // We don't need to explicitly add user ID here as the backend will extract it from the token
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Group creation failed:', data);
        throw new Error(data.message || 'Failed to create group');
      }
      
      console.log('Group created successfully:', data);
      setGroups([...groups, data.data]);
      return data.data;
    } catch (error) {
      console.error('Error creating group:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update a group
  const updateGroup = async (groupId, groupData) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${config.apiUrl}/api/groups/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(groupData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update group');
      }
      
      setGroups(groups.map(group => 
        group._id === groupId ? data.data : group
      ));
      
      return data.data;
    } catch (error) {
      console.error('Error updating group:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a group
  const deleteGroup = async (groupId) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${config.apiUrl}/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete group');
      }
      
      setGroups(groups.filter(group => group._id !== groupId));
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add a member to a group
  const addMember = async (groupId, email) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${config.apiUrl}/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add member');
      }
      
      setGroups(groups.map(group => 
        group._id === groupId ? data.data : group
      ));
      
      return data.data;
    } catch (error) {
      console.error('Error adding member:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Remove a member from a group
  const removeMember = async (groupId, userId) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${config.apiUrl}/api/groups/${groupId}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove member');
      }
      
      setGroups(groups.map(group => 
        group._id === groupId ? data.data : group
      ));
      
      return data.data;
    } catch (error) {
      console.error('Error removing member:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch bills for a specific group
  const fetchGroupBills = useCallback(async (groupId) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${config.apiUrl}/api/groups/${groupId}/bills`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch bills');
      }
      
      setBills(data.data);
      return data.data;
    } catch (error) {
      console.error('Error fetching group bills:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch all bills for the current user
  const fetchBills = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${config.apiUrl}/api/bills`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch bills');
      }
      
      setBills(data.data);
      return data.data;
    } catch (error) {
      console.error('Error fetching bills:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create a new bill
  const createBill = async (billData) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${config.apiUrl}/api/bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(billData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create bill');
      }
      
      setBills([...bills, data.data]);
      return data.data;
    } catch (error) {
      console.error('Error creating bill:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mark a share as paid
  const markShareAsPaid = async (billId, shareId) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${config.apiUrl}/api/bills/${billId}/shares/${shareId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to mark share as paid');
      }
      
      setBills(bills.map(bill => 
        bill._id === billId ? data.data : bill
      ));
      
      return data.data;
    } catch (error) {
      console.error('Error marking share as paid:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Load groups when the component mounts
  useEffect(() => {
    if (token) {
      fetchGroups();
    }
  }, [token]);

  const value = {
    user,
    groups,
    bills,
    loading,
    error,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    fetchGroupBills,
    fetchBills,
    createBill,
    markShareAsPaid
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
};

export default GroupContext;
