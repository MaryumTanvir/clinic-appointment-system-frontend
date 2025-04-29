import React, { useState, useEffect } from 'react'
import Layout from '../../components/admin/Layout'
import { Search, Plus } from 'lucide-react'
import { Modal, notification } from 'antd'
import axios from 'axios'

const AdminShifts = () => {
  const [shifts, setShifts] = useState([])
  const [doctors, setDoctors] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newShift, setNewShift] = useState({
    doctorId: '',
    date: '',
    shiftType: 'morning',
    location: '',
    startTime: '09:00',
    endTime: '17:00'
  })

  const itemsPerPage = 5

  useEffect(() => {
    fetchShifts()
    fetchDoctors()
  }, [])

  const fetchShifts = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:5000/api/admin/shifts', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShifts(res.data.data || [])
    } catch (error) {
      console.error('Failed to fetch shifts:', error)
    }
  }

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:5000/api/admin/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDoctors(res.data.data || [])
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
    }
  }

  const filteredShifts = shifts.filter(shift => {
    const doctorFullName = `${shift.doctorId?.firstName || ''} ${
      shift.doctorId?.lastName || ''
    }`.toLowerCase()
    return (
      doctorFullName.includes(searchTerm.toLowerCase()) ||
      shift.shiftType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const indexOfLast = currentPage * itemsPerPage
  const indexOfFirst = indexOfLast - itemsPerPage
  const currentShifts = filteredShifts.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(filteredShifts.length / itemsPerPage)

  const handleSearch = e => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = page => {
    setCurrentPage(page)
  }

  const handleCreateClick = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateShiftChange = e => {
    const { name, value } = e.target

    if (name === 'shiftType') {
      let updatedShiftTimes = {}
      if (value === 'morning') {
        updatedShiftTimes = { startTime: '09:00', endTime: '17:00' }
      } else if (value === 'evening') {
        updatedShiftTimes = { startTime: '17:00', endTime: '01:00' }
      } else if (value === 'night') {
        updatedShiftTimes = { startTime: '01:00', endTime: '09:00' }
      }
      setNewShift(prev => ({
        ...prev,
        shiftType: value,
        ...updatedShiftTimes
      }))
    } else {
      setNewShift(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleCreateShiftSubmit = async e => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        'http://localhost:5000/api/admin/assign-shift',
        newShift,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      notification.success({
        message: 'Success',
        description: 'Shift assigned successfully!'
      })
      setIsCreateModalOpen(false)
      setNewShift({
        doctorId: '',
        date: '',
        shiftType: 'morning',
        location: '',
        startTime: '09:00',
        endTime: '17:00'
      })
      fetchShifts()
    } catch (error) {
      console.error('Failed to create shift:', error)
      if (error.response?.status === 400) {
        notification.error({
          message: 'Cannot Assign Shift',
          description:
            error.response?.data?.message ||
            'Doctor already has a shift on this date!'
        })
      } else {
        notification.error({
          message: 'Error',
          description: 'An unexpected error occurred.'
        })
      }
    }
  }

  return (
    <Layout>
      <div className='h-full'>
        <h1 className='text-3xl font-bold mb-2'>Manage Shifts</h1>
        <p className='text-gray-600 mb-8'>Welcome to the management system!</p>

        <div className='bg-[#E3F1F1] rounded-lg p-6'>
          <div className='flex justify-end mb-6'>
            <button
              className='bg-[#4A628A] text-white py-2 px-4 rounded hover:bg-[#3A5275] flex items-center gap-2'
              onClick={handleCreateClick}
              style={{ color: 'white' , padding:"13px" }}

            >
              <Plus size={18} /> Assign Shift
            </button>
          </div>

          {/* Search */}
          <div className='relative mb-6'>
            <input
              type='text'
              placeholder='Search...'
              className='w-full py-3 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4A628A]'
              value={searchTerm}
              onChange={handleSearch}
            />
            <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
              <Search size={20} className='text-gray-500' />
            </div>
          </div>

          {/* Shifts Table */}
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='bg-[#4A628A] text-white'>
                  <th className='py-3 px-4 text-left'>Doctor Name</th>
                  <th className='py-3 px-4 text-left'>Date</th>
                  <th className='py-3 px-4 text-left'>Start Time</th>
                  <th className='py-3 px-4 text-left'>End Time</th>
                  <th className='py-3 px-4 text-left'>Shift Type</th>
                  <th className='py-3 px-4 text-left'>Location</th>
                </tr>
              </thead>
              <tbody>
                {currentShifts.map((shift, index) => (
                  <tr
                    key={shift._id}
                    className={`${
                      index % 2 === 0 ? 'bg-[#E3F1F1]' : 'bg-[#D5E7E8]'
                    } border-b`}
                  >
                    <td className='py-3 px-4'>
                      {shift.doctorId?.firstName} {shift.doctorId?.lastName}
                    </td>
                    <td className='py-3 px-4'>
                      {new Date(shift.date).toLocaleDateString()}
                    </td>
                    <td className='py-3 px-4'>{shift.startTime}</td>
                    <td className='py-3 px-4'>{shift.endTime}</td>
                    <td className='py-3 px-4 capitalize'>{shift.shiftType}</td>
                    <td className='py-3 px-4'>{shift.location || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className='flex justify-end mt-4 items-center'>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              pageNumber => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === pageNumber
                      ? 'bg-[#4A628A] text-white'
                      : 'text-[#4A628A]'
                  }`}

                  style={{ color: 'white' }}
                >

                  {pageNumber}
                </button>
              )
            )}
          </div>
        </div>

        {/* Create Shift Modal */}
        <Modal
          title='Assign New Shift'
          open={isCreateModalOpen}
          onCancel={() => setIsCreateModalOpen(false)}
          footer={null}
          centered
        >
          <form onSubmit={handleCreateShiftSubmit} className='space-y-4'>
            <div>
              <label className='block mb-1'>Doctor</label>
              <select
                name='doctorId'
                value={newShift.doctorId}
                onChange={handleCreateShiftChange}
                required
                className='w-full border px-3 py-2 rounded'
              >
                <option value=''>Select Doctor</option>
                {doctors.map(doc => (
                  <option key={doc.user._id} value={doc.user._id}>
                    {doc.user.firstName} {doc.user.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block mb-1'>Date</label>
              <input
                type='date'
                name='date'
                value={newShift.date}
                onChange={handleCreateShiftChange}
                required
                className='w-full border px-3 py-2 rounded'
              />
            </div>

            <div>
              <label className='block mb-1'>Shift Type</label>
              <select
                name='shiftType'
                value={newShift.shiftType}
                onChange={handleCreateShiftChange}
                required
                className='w-full border px-3 py-2 rounded'
              >
                <option value='morning'>Morning</option>
                <option value='evening'>Evening</option>
                <option value='night'>Night</option>
              </select>
            </div>

            <div>
              <label className='block mb-1'>Location</label>
              <input
                type='text'
                name='location'
                value={newShift.location}
                onChange={handleCreateShiftChange}
                className='w-full border px-3 py-2 rounded'
              />
            </div>

            <div className='flex justify-end'>
              <button
                type='button'
                onClick={() => setIsCreateModalOpen(false)}
                className='mr-2 bg-red  px-4 py-2 border border-red-300 rounded'
                style={{ color: 'red', margin: '2px' }}
              >
                Cancel
              </button>
              <button
                data-testid="Assign-btn"
                type='submit'
                className=' px-4 py-2 bg-[#4A628A] text-white rounded'
                style={{ color: 'white', margin: '2px' }}
              >
                Assign
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}

export default AdminShifts
