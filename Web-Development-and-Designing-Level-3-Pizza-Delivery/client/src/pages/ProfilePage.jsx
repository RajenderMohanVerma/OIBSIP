import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Add Address State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    street: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '',
    phone: user?.phone || '',
  });
  const [addingAddress, setAddingAddress] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty.');

    try {
      setUpdatingProfile(true);
      await authService.updateProfile({ name: name.trim(), phone: phone.trim() });
      await refreshUser();
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.street.trim() || !newAddr.postalCode.trim()) {
      return toast.error('Street and postal code are required.');
    }

    try {
      setAddingAddress(true);
      await authService.addAddress(newAddr);
      await refreshUser();
      toast.success('Address saved successfully!');
      setShowAddAddress(false);
      setNewAddr({
        label: 'Home',
        street: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '',
        phone: user?.phone || '',
      });
    } catch (err) {
      console.error('Add address error:', err);
      toast.error(err.response?.data?.message || 'Failed to add address.');
    } finally {
      setAddingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await authService.deleteAddress(addressId);
      await refreshUser();
      toast.success('Address removed.');
    } catch (err) {
      console.error('Delete address error:', err);
      toast.error('Failed to remove address.');
    }
  };

  return (
    <div className="profile-page page-enter">
      <div className="container">
        <div className="profile-header">
          <span className="micro-label">ACCOUNT SETTINGS</span>
          <h1 className="profile-title font-display">PROFILE &amp; ADDRESSES</h1>
        </div>

        <div className="profile-layout">
          {/* Left Column: Personal Info Form */}
          <div className="card profile-card">
            <h2 className="card-title">Personal Details</h2>

            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="form-input disabled"
                />
                <span className="form-hint">Email cannot be changed after registration.</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  placeholder="+91 98765 43210"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={updatingProfile}
              >
                {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Right Column: Saved Delivery Addresses */}
          <div className="card profile-card">
            <div className="addresses-header-row">
              <h2 className="card-title">Saved Addresses</h2>
              {!showAddAddress && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddAddress(true)}
                  disabled={(user?.savedAddresses?.length || 0) >= 5}
                >
                  + Add Address
                </button>
              )}
            </div>

            {/* Add Address Form Accordion */}
            {showAddAddress && (
              <form onSubmit={handleAddAddress} className="add-address-form">
                <h3 className="sub-heading">New Address Details</h3>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Label (e.g. Home, Office)</label>
                    <input
                      type="text"
                      value={newAddr.label}
                      onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address *</label>
                  <input
                    type="text"
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    className="form-input"
                    placeholder="House/Flat number, building, street..."
                    required
                  />
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">PIN Code *</label>
                    <input
                      type="text"
                      value={newAddr.postalCode}
                      onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="address-form-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowAddAddress(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={addingAddress}
                  >
                    {addingAddress ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            )}

            {/* List of Addresses */}
            <div className="saved-addresses-list">
              {user?.savedAddresses && user.savedAddresses.length > 0 ? (
                user.savedAddresses.map((addr) => (
                  <div key={addr._id} className="address-item-card">
                    <div className="address-item-header">
                      <span className="address-label-badge">{addr.label}</span>
                      <button
                        type="button"
                        className="btn-delete-addr"
                        onClick={() => handleDeleteAddress(addr._id)}
                        aria-label={`Delete ${addr.label} address`}
                      >
                        ✕ Remove
                      </button>
                    </div>
                    <p className="address-text">{addr.street}</p>
                    <p className="address-text">{addr.city}, {addr.state} {addr.postalCode}</p>
                    {addr.phone && <p className="address-phone">📞 {addr.phone}</p>}
                  </div>
                ))
              ) : (
                <p className="no-address-text">No delivery addresses saved yet. Add one above to speed up checkout.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

