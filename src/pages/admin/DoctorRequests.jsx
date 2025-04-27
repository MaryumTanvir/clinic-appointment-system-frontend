import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Layout from '../../components/admin/Layout';
import axios from 'axios';

const DoctorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/admin/doctor-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredRequests = requests.filter((req) =>
    req.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.credentials.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastRequest = currentPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/doctor-requests/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };
  
  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/doctor-requests/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };
  
  return (
    <Layout>
      <div className="h-full">
        <h1 className="text-3xl font-bold mb-2">Manage Requests</h1>
        <p className="text-gray-600 mb-8">welcome to the management system!</p>

        <div className="bg-[#E3F1F1] rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Manage Requests</h2>

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
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRequests.map((request, index) => (
                  <tr
                    key={request._id}
                    className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-[#E3F1F1]' : 'bg-[#D5E7E8]'}`}
                  >
                    <td className="py-3 px-4">{request.firstName}</td>
                    <td className="py-3 px-4">{request.lastName}</td>
                    <td className="py-3 px-4">{request.gender}</td>
                    <td className="py-3 px-4">{request.specialty}</td>
                    <td className="py-3 px-4">{request.credentials}</td>
                    <td className="py-3 px-4">{request.email}</td>
                    <td className="py-3 px-4 flex justify-center gap-2">
                      <button
                        className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600 transition-colors"
                        onClick={() => handleApprove(request._id)}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-white text-[#FF6B6B] border border-[#FF6B6B] py-1 px-4 rounded hover:bg-[#FFEEEE] transition-colors"
                        onClick={() => handleReject(request._id)}
                      >
                        Reject
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
                onClick={() => setCurrentPage(pageNumber)}
                className={`mx-1 px-3 py-1 rounded ${currentPage === pageNumber ? 'bg-[#4A628A] text-white' : 'text-[#4A628A]'}`}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorRequests;
