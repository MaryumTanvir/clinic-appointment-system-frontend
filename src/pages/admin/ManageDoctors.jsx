import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, X } from 'lucide-react';
import Layout from '../../components/admin/Layout';
import { Modal } from 'antd';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [deleteDoctorId, setDeleteDoctorId] = useState(null);
  const [customError, setCustomError] = useState(null);

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    specialty: '',
    credentials: '',
    consultationFee: '',
  });

  const itemsPerPage = 9;

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/admin/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  useEffect(() => {
    if (customError) {
      const timer = setTimeout(() => setCustomError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [customError]);

  const filteredDoctors = doctors.filter(({ user, profile }) =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (profile?.specialty || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (profile?.credentials || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastDoctor = currentPage * itemsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - itemsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEditClick = (doctor) => {
    setCurrentDoctor(doctor);
    setEditFormData({
      firstName: doctor.user.firstName,
      lastName: doctor.user.lastName,
      gender: doctor.user.gender,
      specialty: doctor.profile?.specialty || '',
      credentials: doctor.profile?.credentials || '',
      consultationFee: doctor.profile?.consultationFee || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/doctors/${currentDoctor.user._id}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditModalOpen(false);
      fetchDoctors();
    } catch (error) {
      console.error('Failed to update doctor:', error);
      setCustomError('Could not update doctor.');
    }
  };

  const handleDeleteClick = (doctorId) => {
    setDeleteDoctorId(doctorId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`http://localhost:5000/api/admin/doctors/${deleteDoctorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        fetchDoctors();
      } else {
        setCustomError(res.data.message || 'Failed to delete doctor.');
      }
    } catch (error) {
      console.error('Failed to delete doctor:', error);

      if (error.response?.status === 400) {
        setCustomError('Cannot delete doctor. Doctor has active or past appointments.');
      } else {
        setCustomError('An unexpected error occurred.');
      }
    } finally {
      setTimeout(() => {
        setIsDeleteModalOpen(false);
        setDeleteDoctorId(null);
      }, 300);
    }
  };

  return (
    <Layout>
      <div className="h-full relative">
        {/* Custom Error Popup */}
        {customError && (
          <div className="fixed top-20 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50 flex items-center justify-between">
            <div>
              <strong className="font-bold">Error: </strong>
              <span>{customError}</span>
            </div>
            <button className="ml-4 font-bold" onClick={() => setCustomError(null)}>×</button>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-2">Manage Doctors</h1>
        <p className="text-gray-600 mb-8">Welcome to the management system!</p>

        <div className="bg-[#E3F1F1] rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Manage Doctors</h2>

          {/* Search */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search..."
              className="w-full py-3 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4A628A]"
              value={searchTerm}
              onChange={handleSearch}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Search size={20} className="text-gray-500" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#4A628A] text-white">
                  <th className="py-3 px-4 text-left">First Name</th>
                  <th className="py-3 px-4 text-left">Last Name</th>
                  <th className="py-3 px-4 text-left">Gender</th>
                  <th className="py-3 px-4 text-left">Specialty</th>
                  <th className="py-3 px-4 text-left">Credentials</th>
                  <th className="py-3 px-4 text-right">Fee</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentDoctors.map((doctor, index) => (
                  <tr
                    key={doctor.user._id}
                    className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-[#E3F1F1]' : 'bg-[#D5E7E8]'}`}
                  >
                    <td className="py-3 px-4">{doctor.user.firstName}</td>
                    <td className="py-3 px-4">{doctor.user.lastName}</td>
                    <td className="py-3 px-4">{doctor.user.gender}</td>
                    <td className="py-3 px-4">{doctor.profile?.specialty || '-'}</td>
                    <td className="py-3 px-4">{doctor.profile?.credentials || '-'}</td>
                    <td className="py-3 px-4 text-right">{doctor.profile?.consultationFee || '-'}</td>
                    <td className="py-3 px-4 flex justify-center gap-2">
                      <button
                        className="bg-[#4A628A] text-white py-1 px-4 rounded hover:bg-[#3A5275] transition-colors"
                        onClick={() => handleEditClick(doctor)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-white text-[#FF6B6B] border border-[#FF6B6B] py-1 px-4 rounded hover:bg-[#FFEEEE] transition-colors"
                        onClick={() => handleDeleteClick(doctor.user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end mt-4 items-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`mx-1 px-3 py-1 rounded ${currentPage === pageNumber ? 'bg-[#4A628A] text-white' : 'text-[#4A628A]'}`}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Delete Modal */}
        <Modal
          title="Confirm Deletion"
          open={isDeleteModalOpen}
          onOk={confirmDelete}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setDeleteDoctorId(null);
          }}
          okText="Yes, Delete"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
          centered
        >
          <p>Are you sure you want to delete this doctor? This action cannot be undone.</p>
        </Modal>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#4A628A]">Edit Doctor</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleEditFormSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input type="text" name="firstName" value={editFormData.firstName} onChange={handleEditFormChange} className="w-full px-3 py-2 border rounded" required placeholder="First Name" />
                  <input type="text" name="lastName" value={editFormData.lastName} onChange={handleEditFormChange} className="w-full px-3 py-2 border rounded" required placeholder="Last Name" />
                </div>
                <input type="text" name="specialty" value={editFormData.specialty} onChange={handleEditFormChange} className="w-full px-3 py-2 border rounded mb-4" required placeholder="Specialty" />
                <input type="text" name="credentials" value={editFormData.credentials} onChange={handleEditFormChange} className="w-full px-3 py-2 border rounded mb-4" required placeholder="Credentials" />
                <input type="text" name="consultationFee" value={editFormData.consultationFee} onChange={handleEditFormChange} className="w-full px-3 py-2 border rounded mb-4" required placeholder="Consultation Fee" />
                <div className="flex justify-end">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="mr-2 px-4 py-2 border rounded">Cancel</button>
                  <button type="submit" className="ml-2 px-4 py-2 bg-[#4A628A] text-white rounded">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageDoctors;
