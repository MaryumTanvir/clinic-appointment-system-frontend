Black Box Test Cases for Healthcare System
Test Case Format

Test Case ID: Unique identifier.
User Story ID: Linked backlog item.
Description: What the test validates.
Preconditions: Setup required.
Test Steps: Cypress commands.
Expected Result: UI/API behavior.
ECP/BVA: Partition or boundary tested.
Priority: High/Medium/Low.

Test Cases
User Story 1: Update or Remove Doctor Profiles
Acceptance Criteria: Admin can update/remove doctor profiles and receive confirmation.
TC_01: Update Doctor Profile with Valid Data

User Story ID: 1
Description: Verify admin can update doctor’s name and specialty.
Preconditions: Logged in as admin, doctor ID exists.
Test Steps:
cy.intercept('PUT', '/api/admin/doctors/*', { statusCode: 200, body: { success: true, message: 'Doctor profile updated' } }).as('updateDoctor')
cy.visit('/admin/doctors')
cy.get('[data-testid="doctor-row-123"]').click()
cy.get('[data-testid="first-name-input"]').clear().type('John')
cy.get('[data-testid="specialty-input"]').clear().type('Cardiology')
cy.get('[data-testid="update-button"]').click()
cy.wait('@updateDoctor')


Expected Result: Success message: “Doctor profile updated”.
ECP: Valid name (letters, 1–50 chars), valid specialty (text).
Priority: Medium

TC_02: Update Doctor Profile with Invalid Name (Empty)

User Story ID: 1
Description: Verify error when updating with empty name.
Preconditions: Logged in as admin, doctor ID exists.
Test Steps:
cy.intercept('PUT', '/api/admin/doctors/*', { statusCode: 400, body: { success: false, message: 'Name is required' } }).as('updateDoctor')
cy.visit('/admin/doctors')
cy.get('[data-testid="doctor-row-123"]').click()
cy.get('[data-testid="first-name-input"]').clear()
cy.get('[data-testid="update-button"]').click()
cy.wait('@updateDoctor')


Expected Result: Error message: “Name is required”.
ECP: Invalid name (empty).
Priority: Medium
BVA: Name length = 0.

TC_03: Remove Doctor Profile

User Story ID: 1
Description: Verify admin can remove a doctor profile.
Preconditions: Logged in as admin, doctor ID exists.
Test Steps:
cy.intercept('DELETE', '/api/admin/doctors/*', { statusCode: 200, body: { success: true, message: 'Doctor removed' } }).as('deleteDoctor')
cy.visit('/admin/doctors')
cy.get('[data-testid="doctor-row-123"] [data-testid="delete-button"]').click()
cy.get('[data-testid="confirm-delete"]').click()
cy.wait('@deleteDoctor')


Expected Result: Success message: “Doctor removed”, doctor row disappears.
ECP: Valid doctor ID.
Priority: Medium

User Story 2: Approve Doctors with Verified Credentials
Acceptance Criteria: Admin can review and approve doctors, granting system access.
TC_04: Approve Doctor with Valid Credentials

User Story ID: 2
Description: Verify admin can approve a doctor.
Preconditions: Logged in as admin, doctor pending approval.
Test Steps:
cy.intercept('POST', '/api/admin/doctors/approve', { statusCode: 200, body: { success: true, message: 'Doctor approved' } }).as('approveDoctor')
cy.visit('/admin/pending-doctors')
cy.get('[data-testid="doctor-row-123"]').click()
cy.get('[data-testid="credentials-file"]').should('contain', 'MD_Cert.pdf')
cy.get('[data-testid="approve-button"]').click()
cy.wait('@approveDoctor')


Expected Result: Success message: “Doctor approved”, doctor moves to active list.
ECP: Valid credentials file (PDF).
Priority: Medium

TC_05: Reject Doctor with Invalid Credentials (Empty File)

User Story ID: 2
Description: Verify error when approving without credentials.
Preconditions: Logged in as admin, doctor pending approval.
Test Steps:
cy.intercept('POST', '/api/admin/doctors/approve', { statusCode: 400, body: { success: false, message: 'Credentials required' } }).as('approveDoctor')
cy.visit('/admin/pending-doctors')
cy.get('[data-testid="doctor-row-123"]').click()
cy.get('[data-testid="approve-button"]').click()
cy.wait('@approveDoctor')


Expected Result: Error message: “Credentials required”.
ECP: Invalid credentials (empty).
Priority: Medium
BVA: File size = 0.

User Story 3: Filter, View Assigned Shifts as a Doctor
Acceptance Criteria: Doctor sees past/current/future assigned shifts with date/time details.
TC_06: View Past Shifts

User Story ID: 3
Description: Verify doctor can filter and view past shifts.
Preconditions: Logged in as doctor, past shifts exist.
Test Steps:
cy.intercept('GET', '/api/doctors/shifts', { statusCode: 200, body: { success: true, data: [{ date: '2025-04-01', time: '10:00' }] } }).as('getShifts')
cy.visit('/doctor/shifts')
cy.get('[data-testid="past-filter"]').click()
cy.wait('@getShifts')


Expected Result: Table shows shift on “2025-04-01, 10:00”.
ECP: Valid filter (past).
Priority: Medium

TC_07: View Future Shifts with Boundary Date

User Story ID: 3
Description: Verify doctor can view shifts on today’s date.
Preconditions: Logged in as doctor, today’s shift exists.
Test Steps:
cy.intercept('GET', '/api/doctors/shifts', { statusCode: 200, body: { success: true, data: [{ date: '2025-04-29', time: '14:00' }] } }).as('getShifts')
cy.visit('/doctor/shifts')
cy.get('[data-testid="current-filter"]').click()
cy.wait('@getShifts')


Expected Result: Table shows shift on “2025-04-29, 14:00”.
ECP: Valid filter (current).
BVA: Date = Today (2025-04-29).
Priority: Medium

User Story 4: Assign Shifts to Doctors
Acceptance Criteria: Admin assigns shifts, and system updates doctor's schedule.
TC_08: Assign Shift with Valid Date/Time

User Story ID: 4
Description: Verify admin can assign a shift.
Preconditions: Logged in as admin, doctor exists.
Test Steps:
cy.intercept('POST', '/api/admin/shifts', { statusCode: 200, body: { success: true, message: 'Shift assigned' } }).as('assignShift')
cy.visit('/admin/shifts')
cy.get('[data-testid="doctor-select"]').select('Dr. John')
cy.get('[data-testid="date-input"]').type('2025-05-01')
cy.get('[data-testid="time-input"]').type('10:00')
cy.get('[data-testid="assign-button"]').click()
cy.wait('@assignShift')


Expected Result: Success message: “Shift assigned”.
ECP: Valid date (future), valid time (00:00–23:59).
Priority: High

TC_09: Assign Shift with Invalid Date (Past)

User Story ID: 4
Description: Verify error for past date.
Preconditions: Logged in as admin, doctor exists.
Test Steps:
cy.intercept('POST', '/api/admin/shifts', { statusCode: 400, body: { success: false, message: 'Date must be future' } }).as('assignShift')
cy.visit('/admin/shifts')
cy.get('[data-testid="doctor-select"]').select('Dr. John')
cy.get('[data-testid="date-input"]').type('2025-04-01')
cy.get('[data-testid="assign-button"]').click()
cy.wait('@assignShift')


Expected Result: Error message: “Date must be future”.
ECP: Invalid date (past).
BVA: Date < Today.
Priority: High

User Story 5: Filter, View Available Doctors as a Patient
Acceptance Criteria: Patient searches for doctors by specialty/availability.
TC_10: Filter Doctors by Specialty

User Story ID: 5
Description: Verify patient can filter by specialty.
Preconditions: Logged in as patient, doctors exist.
Test Steps:
cy.intercept('GET', '/api/patients/doctors', { statusCode: 200, body: { success: true, data: [{ firstName: 'John', specialty: 'Cardiology' }] } }).as('getDoctors')
cy.visit('/patient/doctors')
cy.get('[data-testid="specialty-filter"]').select('Cardiology')
cy.wait('@getDoctors')


Expected Result: Table shows “John” with “Cardiology”.
ECP: Valid specialty.
Priority: High

TC_11: Filter Doctors with Invalid Specialty

User Story ID: 5
Description: Verify no results for invalid specialty.
Preconditions: Logged in as patient.
Test Steps:
cy.intercept('GET', '/api/patients/doctors', { statusCode: 200, body: { success: true, data: [] } }).as('getDoctors')
cy.visit('/patient/doctors')
cy.get('[data-testid="specialty-filter"]').select('Invalid')
cy.wait('@getDoctors')


Expected Result: “No doctors found” message.
ECP: Invalid specialty.
Priority: High

User Story 6: Register as a Patient
Acceptance Criteria: Patient fills form, gets registered, and receives login credentials.
TC_12: Register with Valid Data

User Story ID: 6
Description: Verify successful patient registration.
Preconditions: Not logged in.
Test Steps:
cy.intercept('POST', '/api/auth/register', { statusCode: 201, body: { success: true, message: 'User registered' } }).as('register')
cy.visit('/login')
cy.get('[data-testid="signup-link"]').click()
cy.get('[data-testid="first-name-input"]').type('John')
cy.get('[data-testid="email-input"]').type('john@clinic.com')
cy.get('[data-testid="password-input"]').type('Password123')
cy.get('[data-testid="submit-button"]').click()
cy.wait('@register')


Expected Result: Success message: “User registered”.
ECP: Valid name, email, password.
Priority: High

TC_13: Register with Invalid Email

User Story ID: 6
Description: Verify error for invalid email format.
Preconditions: Not logged in.
Test Steps:
cy.intercept('POST', '/api/auth/register', { statusCode: 400, body: { success: false, message: 'Invalid email' } }).as('register')
cy.visit('/login')
cy.get('[data-testid="signup-link"]').click()
cy.get('[data-testid="first-name-input"]').type('John')
cy.get('[data-testid="email-input"]').type('invalid')
cy.get('[data-testid="password-input"]').type('Password123')
cy.get('[data-testid="submit-button"]').click()
cy.wait('@register')


Expected Result: Error message: “Invalid email”.
ECP: Invalid email format.
Priority: High

TC_14: Register with Short Password

User Story ID: 6
Description: Verify error for password < 6 chars.
Preconditions: Not logged in.
Test Steps:
cy.intercept('POST', '/api/auth/register', { statusCode: 400, body: { success: false, message: 'Password too short' } }).as('register')
cy.visit('/login')
cy.get('[data-testid="signup-link"]').click()
cy.get('[data-testid="first-name-input"]').type('John')
cy.get('[data-testid="email-input"]').type('john@clinic.com')
cy.get('[data-testid="password-input"]').type('Pass')
cy.get('[data-testid="submit-button"]').click()
cy.wait('@register')


Expected Result: Error message: “Password too short”.
ECP: Invalid password (length < 6).
BVA: Password length = 5.
Priority: High

User Story 7: Schedule an Appointment
Acceptance Criteria: Patient selects doctor/time, appointment is confirmed.
TC_15: Schedule Appointment with Valid Slot

User Story ID: 7
Description: Verify patient can book an appointment.
Preconditions: Logged in as patient, doctor available.
Test Steps:
cy.intercept('POST', '/api/patients/appointments', { statusCode: 200, body: { success: true, message: 'Appointment booked' } }).as('bookAppointment')
cy.visit('/patient/doctors')
cy.get('[data-testid="doctor-row-123"] [data-testid="book-button"]').click()
cy.get('[data-testid="date-picker"]').type('2025-05-01')
cy.get('[data-testid="time-select"]').select('10:00')
cy.get('[data-testid="submit-button"]').click()
cy.wait('@bookAppointment')


Expected Result: Success message: “Appointment booked”.
ECP: Valid date, time.
Priority: High

TC_16: Schedule Appointment with Past Date

User Story ID: 7
Description: Verify error for past date.
Preconditions: Logged in as patient, doctor available.
Test Steps:
cy.intercept('POST', '/api/patients/appointments', { statusCode: 400, body: { success: false, message: 'Invalid date' } }).as('bookAppointment')
cy.visit('/patient/doctors')
cy.get('[data-testid="doctor-row-123"] [data-testid="book-button"]').click()
cy.get('[data-testid="date-picker"]').type('2025-04-01')
cy.get('[data-testid="submit-button"]').click()
cy.wait('@bookAppointment')


Expected Result: Error message: “Invalid date”.
ECP: Invalid date (past).
BVA: Date < Today.
Priority: High

User Story 8: Cancel an Appointment
Acceptance Criteria: Patient cancels appointment, slot becomes available.
TC_17: Cancel Upcoming Appointment

User Story ID: 8
Description: Verify patient can cancel an appointment.
Preconditions: Logged in as patient, appointment exists.
Test Steps:
cy.intercept('DELETE', '/api/patients/appointments/*', { statusCode: 200, body: { success: true, message: 'Appointment canceled' } }).as('cancelAppointment')
cy.visit('/patient/appointments')
cy.get('[data-testid="appointment-row-123"] [data-testid="cancel-button"]').click()
cy.get('[data-testid="confirm-cancel"]').click()
cy.wait('@cancelAppointment')


Expected Result: Success message: “Appointment canceled”, slot removed.
ECP: Valid appointment ID.
Priority: Medium

TC_18: Cancel Non-Existent Appointment

User Story ID: 8
Description: Verify error for invalid appointment ID.
Preconditions: Logged in as patient.
Test Steps:
cy.intercept('DELETE', '/api/patients/appointments/*', { statusCode: 404, body: { success: false, message: 'Appointment not found' } }).as('cancelAppointment')
cy.visit('/patient/appointments')
cy.request('DELETE', '/api/patients/appointments/999') // Simulate invalid ID
cy.wait('@cancelAppointment')


Expected Result: Error message: “Appointment not found”.
ECP: Invalid appointment ID.
Priority: Medium

User Story 9: Filter, View Upcoming Appointments as a Doctor
Acceptance Criteria: Doctor sees upcoming appointments with patient details.
TC_19: View Upcoming Appointments

User Story ID: 9
Description: Verify doctor can view upcoming appointments.
Preconditions: Logged in as doctor, appointments exist.
Test Steps:
cy.intercept('GET', '/api/doctors/appointments', { statusCode: 200, body: { success: true, data: [{ patient: 'John', date: '2025-05-01' }] } }).as('getAppointments')
cy.visit('/doctor/appointments')
cy.get('[data-testid="upcoming-filter"]').click()
cy.wait('@getAppointments')


Expected Result: Table shows appointment with “John, 2025-05-01”.
ECP: Valid filter (upcoming).
Priority: Medium

TC_20: No Upcoming Appointments

User Story ID: 9
Description: Verify message when no appointments exist.
Preconditions: Logged in as doctor.
Test Steps:
cy.intercept('GET', '/api/doctors/appointments', { statusCode: 200, body: { success: true, data: [] } }).as('getAppointments')
cy.visit('/doctor/appointments')
cy.get('[data-testid="upcoming-filter"]').click()
cy.wait('@getAppointments')


Expected Result: “No appointments found” message.
ECP: Empty result set.
Priority: Medium

User Story 10: Filter, View Past and Upcoming Appointments as a Patient
Acceptance Criteria: Patient sees past/future appointments, data is accurate.
TC_21: View Past Appointments

User Story ID: 10
Description: Verify patient can view past appointments.
Preconditions: Logged in as patient, past appointments exist.
Test Steps:
cy.intercept('GET', '/api/patients/appointments', { statusCode: 200, body: { success: true, data: [{ doctor: 'John', date: '2025-04-01' }] } }).as('getAppointments')
cy.visit('/patient/appointments')
cy.get('[data-testid="past-filter"]').click()
cy.wait('@getAppointments')


Expected Result: Table shows appointment with “John, 2025-04-01”.
ECP: Valid filter (past).
Priority: High

TC_22: View Upcoming Appointments with Boundary Date

User Story ID: 10
Description: Verify patient can view appointment on today.
Preconditions: Logged in as patient, today’s appointment exists.
Test Steps:
cy.intercept('GET', '/api/patients/appointments', { statusCode: 200, body: { success: true, data: [{ doctor: 'John', date: '2025-04-29' }] } }).as('getAppointments')
cy.visit('/patient/appointments')
cy.get('[data-testid="upcoming-filter"]').click()
cy.wait('@getAppointments')


Expected Result: Table shows appointment with “John, 2025-04-29”.
ECP: Valid filter (upcoming).
BVA: Date = Today.
Priority: High

User Story 11: Submit Feedback After an Appointment
Acceptance Criteria: Patient submits feedback, stored in system.
TC_23: Submit Valid Feedback

User Story ID: 11
Description: Verify patient can submit feedback.
Preconditions: Logged in as patient, appointment completed.
Test Steps:
cy.intercept('POST', '/api/patients/feedback', { statusCode: 200, body: { success: true, message: 'Feedback submitted' } }).as('submitFeedback')
cy.visit('/patient/appointments')
cy.get('[data-testid="appointment-row-123"] [data-testid="feedback-button"]').click()
cy.get('[data-testid="feedback-input"]').type('Great service')
cy.get('[data-testid="submit-button"]').click()
cy.wait('@submitFeedback')


Expected Result: Success message: “Feedback submitted”.
ECP: Valid feedback (1–500 chars).
Priority: Low

TC_24: Submit Empty Feedback

User Story ID: 11
Description: Verify error for empty feedback.
Preconditions: Logged in as patient, appointment completed.
Test Steps:
cy.intercept('POST', '/api/patients/feedback', { statusCode: 400, body: { success: false, message: 'Feedback required' } }).as('submitFeedback')
cy.visit('/patient/appointments')
cy.get('[data-testid="appointment-row-123"] [data-testid="feedback-button"]').click()
cy.get('[data-testid="submit-button"]').click()
cy.wait('@submitFeedback')


Expected Result: Error message: “Feedback required”.
ECP: Invalid feedback (empty).
BVA: Feedback length = 0.
Priority: Low

User Story 12: Update & View Feedback as a Doctor
Acceptance Criteria: Doctor sees patient comments and ratings, acknowledges it.
TC_25: View Patient Feedback

User Story ID: 12
Description: Verify doctor can view feedback.
Preconditions: Logged in as doctor, feedback exists.
Test Steps:
cy.intercept('GET', '/api/doctors/feedback', { statusCode: 200, body: { success: true, data: [{ patient: 'John', comment: 'Great' }] } }).as('getFeedback')
cy.visit('/doctor/feedback')
cy.wait('@getFeedback')


Expected Result: Table shows “John, Great”.
ECP: Valid feedback data.
Priority: Low

TC_26: Acknowledge Feedback

User Story ID: 12
Description: Verify doctor can acknowledge feedback.
Preconditions: Logged in as doctor, feedback exists.
Test Steps:
cy.intercept('PUT', '/api/doctors/feedback/*', { statusCode: 200, body: { success: true, message: 'Feedback acknowledged' } }).as('acknowledgeFeedback')
cy.visit('/doctor/feedback')
cy.get('[data-testid="feedback-row-123"] [data-testid="acknowledge-button"]').click()
cy.wait('@acknowledgeFeedback')


Expected Result: Success message: “Feedback acknowledged”.
ECP: Valid feedback ID.
Priority: Low

User Story 13: View Consultation Fee Online
Acceptance Criteria: Patient sees bill in payment section.
TC_27: View Consultation Fee

User Story ID: 13
Description: Verify patient can view fee.
Preconditions: Logged in as patient, appointment exists.
Test Steps:
cy.intercept('GET', '/api/patients/payments', { statusCode: 200, body: { success: true, data: [{ fee: 100 }] } }).as('getPayments')
cy.visit('/patient/payments')
cy.wait('@getPayments')


Expected Result: Table shows fee “$100”.
ECP: Valid fee data.
Priority: Medium

TC_28: View Zero Fee (Boundary)

User Story ID: 13
Description: Verify patient can view $0 fee.
Preconditions: Logged in as patient, appointment exists.
Test Steps:
cy.intercept('GET', '/api/patients/payments', { statusCode: 200, body: { success: true, data: [{ fee: 0 }] } }).as('getPayments')
cy.visit('/patient/payments')
cy.wait('@getPayments')


Expected Result: Table shows fee “$0”.
ECP: Valid fee (0).
BVA: Fee = 0.
Priority: Medium

User Story 14: Reschedule an Appointment
Acceptance Criteria: Patient selects new time, system updates appointment.
TC_29: Reschedule Appointment with Valid Slot

User Story ID: 14
Description: Verify patient can reschedule.
Preconditions: Logged in as patient, appointment exists.
Test Steps:
cy.intercept('PUT', '/api/patients/appointments/*', { statusCode: 200, body: { success: true, message: 'Appointment rescheduled' } }).as('rescheduleAppointment')
cy.visit('/patient/appointments')
cy.get('[data-testid="appointment-row-123"] [data-testid="reschedule-button"]').click()
cy.get('[data-testid="date-picker"]').type('2025-05-02')
cy.get('[data-testid="time-select"]').select('11:00')
cy.get('[data-testid="submit-button"]').click()
cy.wait('@rescheduleAppointment')


Expected Result: Success message: “Appointment rescheduled”.
ECP: Valid date, time.
Priority: Low

TC_30: Reschedule with Past Date

User Story ID: 14
Description: Verify error for past date.
Preconditions: Logged in as patient, appointment exists.
Test Steps:
cy.intercept('PUT', '/api/patients/appointments/*', { statusCode: 400, body: { success: false, message: 'Invalid date' } }).as('rescheduleAppointment')
cy.visit('/patient/appointments')
cy.get('[data-testid="appointment-row-123"] [data-testid="reschedule-button"]').click()
cy.get('[data-testid="date-picker"]').type('2025-04-01')
cy.get('[data-testid="submit-button"]').click()
cy.wait('@rescheduleAppointment')


Expected Result: Error message: “Invalid date”.
ECP: Invalid date (past).
BVA: Date < Today.
Priority: Low

User Story 15: Update Appointment Completion Status as a Doctor
Acceptance Criteria: Doctor marks appointment completed, availability updates.
TC_31: Mark Appointment as Completed

User Story ID: 15
Description: Verify doctor can mark appointment completed.
Preconditions: Logged in as doctor, appointment exists.
Test Steps:
cy.intercept('PUT', '/api/doctors/appointments/*/status', { statusCode: 200, body: { success: true, message: 'Appointment completed' } }).as('updateStatus')
cy.visit('/doctor/appointments')
cy.get('[data-testid="appointment-row-123"] [data-testid="complete-button"]').click()
cy.wait('@updateStatus')


Expected Result: Success message: “Appointment completed”, status updates.
ECP: Valid appointment ID.
Priority: Medium

TC_32: Mark Non-Existent Appointment

User Story ID: 15
Description: Verify error for invalid appointment ID.
Preconditions: Logged in as doctor.
Test Steps:
cy.intercept('PUT', '/api/doctors/appointments/*/status', { statusCode: 404, body: { success: false, message: 'Appointment not found' } }).as('updateStatus')
cy.request('PUT', '/api/doctors/appointments/999/status')
cy.wait('@updateStatus')


Expected Result: Error message: “Appointment not found”.
ECP: Invalid appointment ID.
Priority: Medium

User Story 16: Login/Register Pages
Acceptance Criteria: Any user can register or login.
TC_33: Login with Valid Credentials

User Story ID: 16
Description: Verify successful login.
Preconditions: User registered.
Test Steps:
cy.intercept('POST', '/api/auth/login', { statusCode: 200, body: { success: true, token: 'mock-token' } }).as('login')
cy.visit('/login')
cy.get('[data-testid="email-input"]').type('john@clinic.com')
cy.get('[data-testid="password-input"]').type('Password123')
cy.get('[data-testid="login-button"]').click()
cy.wait('@login')


Expected Result: Redirects to dashboard.
ECP: Valid email, password.
Priority: High

TC_34: Login with Invalid Password

User Story ID: 16
Description: Verify error for wrong password.
Preconditions: User registered.
Test Steps:
cy.intercept('POST', '/api/auth/login', { statusCode: 401, body: { success: false, message: 'Invalid credentials' } }).as('login')
cy.visit('/login')
cy.get('[data-testid="email-input"]').type('john@clinic.com')
cy.get('[data-testid="password-input"]').type('WrongPass')
cy.get('[data-testid="login-button"]').click()
cy.wait('@login')


Expected Result: Error message: “Invalid credentials”.
ECP: Invalid password.
Priority: High

TC_35: Login with Empty Email

User Story ID: 16
Description: Verify error for empty email.
Preconditions: Not logged in.
Test Steps:
cy.intercept('POST', '/api/auth/login', { statusCode: 400, body: { success: false, message: 'Email required' } }).as('login')
cy.visit('/login')
cy.get('[data-testid="password-input"]').type('Password123')
cy.get('[data-testid="login-button"]').click()
cy.wait('@login')


Expected Result: Error message: “Email required”.
ECP: Invalid email (empty).
BVA: Email length = 0.
Priority: High

Additional Test Cases for ECP and BVA
To reach 50+ test cases, I’ll add more scenarios for critical user stories (6, 7, 10, 16) focusing on ECP and BVA.
TC_36: Register with Max Length Name

User Story ID: 6
Description: Verify registration with 50-char name.
Preconditions: Not logged in.
Test Steps:
cy.intercept('POST', '/api/auth/register', { statusCode: 201, body: { success: true, message: 'User registered' } }).as('register')
cy.visit('/login')
cy.get('[data-testid="signup-link"]').click()
cy.get('[data-testid="first-name-input"]').type('A'.repeat(50))
cy.get('[data-testid="email-input"]').type('john@clinic.com')
cy.get('[data-testid="password-input"]').type('Password123')
cy.get('[data-testid="submit-button"]').click()
cy.wait('@register')


Expected Result: Success message: “User registered”.
ECP: Valid name.
BVA: Name length = 50.
Priority: High

TC_37: Register with Overlength Name

User Story ID: 6
Description: Verify error for 51-char name.
Preconditions: Not logged in.
Test Steps:
cy.intercept('POST', '/api/auth/register', { statusCode: 400, body: { success: false, message: 'Name too long' } }).as('register')
cy.visit('/login')
cy.get('[data-testid="signup-link"]').click()
cy.get('[data-testid="first-name-input"]').type('A'.repeat(51))
cy.get('[data-testid="email-input"]').type('john@clinic.com')
cy.get('[data-testid="password-input"]').type('Password123')
cy.get('[data-testid="submit-button"]').click()
cy.wait('@register')


Expected Result: Error message: “Name too long”.
ECP: Invalid name (overlength).
BVA: Name length = 51.
Priority: High

TC_38: Schedule Appointment with Max Time (23:59)

User Story ID: 7
Description: Verify booking at 23:59.
Preconditions: Logged in as patient, doctor available.
Test Steps:
cy.intercept('POST', '/api/patients/appointments', { statusCode: 200, body: { success: true, message: 'Appointment booked' } }).as('bookAppointment')
cy.visit('/patient/doctors')
cy.get('[data-testid="doctor-row-123"] [data-testid="book-button"]').click()
cy.get('[data-testid="date-picker"]').type('2025-05-01')
cy.get('[data-testid="time-select"]').select('23:59')
cy.get('[data-testid="submit-button"]').click()
cy.wait('@bookAppointment')


Expected Result: Success message: “Appointment booked”.
ECP: Valid time.
BVA: Time = 23:59.
Priority: High

TC_39: Schedule Appointment with Min Time (00:00)

User Story ID: 7
Description: Verify booking at 00:00.
Preconditions: Logged in as patient, doctor available.
Test Steps:
cy.intercept('POST', '/api/patients/appointments', { statusCode: 200, body: { success: true, message: 'Appointment booked' } }).as('bookAppointment')
cy.visit('/patient/doctors')
cy.get('[data-testid="doctor-row-123"] [data-testid="book-button"]').click()
cy.get('[data-testid="date-picker"]').type('2025-05-01')
cy.get('[data-testid="time-select"]').select('00:00')
cy.get('[data-testid="submit-button"]').click()
cy.wait('@bookAppointment')


Expected Result: Success message: “Appointment booked”.
ECP: Valid time.
BVA: Time = 00:00.
Priority: High

TC_40: View Appointments with Max Fee ($1000)

User Story ID: 13
Description: Verify patient can view $1000 fee.
Preconditions: Logged in as patient, appointment exists.
Test Steps:
cy.intercept('GET', '/api/patients/payments', { statusCode: 200, body: { success: true, data: [{ fee: 1000 }] } }).as('getPayments')
cy.visit('/patient/payments')
cy.wait('@getPayments')


Expected Result: Table shows fee “$1000”.
ECP: Valid fee.
BVA: Fee = 1000.
Priority: Medium

TC_41: Register with Min Age (1)

User Story ID: 6
Description: Verify registration with age = 1.
Preconditions: Not logged in.
Test Steps:
cy.intercept('POST', '/api/auth/register', { statusCode: 201, body: { success: true, message: 'User registered' } }).as('register')
cy.visit('/login')
cy.get('[data-testid="signup-link"]').click()
cy.get('[data-testid="first-name-input"]').type('John')
cy.get('[data-testid="email-input"]').type('john@clinic.com')
cy.get('[data-testid="password-input"]').type('Password123')
cy.get('[data-testid="age-input"]').type('1')
cy.get('[data-testid="submit-button"]').click()
cy.wait('@register')


Expected Result: Success message: “User registered”.
ECP: Valid age.
BVA: Age = 1.
Priority: High

TC_42: Register with Max Age (150)

User Story ID: 6
Description: Verify registration with age = 150.
Preconditions: Not logged in.
Test Steps:
cy.intercept('POST', '/api/auth/register', { statusCode: 201, body: { success: true, message: 'User registered' } }).as('register')
cy.visit('/login')
cy.get('[data-testid="signup-link"]').click()
cy.get('[data-testid="first-name-input"]').type('John')
cy.get('[data-testid="email-input"]').type('john@clinic.com')
cy.get('[data-testid="password-input"]').type('Password123')
cy.get('[data-testid="age-input"]').type('150')
cy.get('[data-testid="submit-button"]').click()
cy.wait('@register')


Expected Result: Success message: “User registered”.
ECP: Valid age.
BVA: Age = 150.
Priority: High

TC_43: Register with Invalid Age (0)

User Story ID: 6
Description: Verify error for age = 0.
Preconditions: Not logged in.
Test Steps:
cy.intercept('POST', '/api/auth/register', { statusCode: 400, body: { success: false, message: 'Invalid age' } }).as('register')
cy.visit('/login')
cy.get('[data-testid="signup-link"]').click()
cy.get('[data-testid="first-name-input"]').type('John')
cy.get('[data-testid="email-input"]').type('john@clinic.com')
cy.get('[data-testid="password-input"]').type('Password123')
cy.get('[data-testid="age-input"]').type('0')
cy.get('[data-testid="submit-button"]').click()
cy.wait('@register')


Expected Result: Error message: “Invalid age”.
ECP: Invalid age.
BVA: Age = 0.
Priority: High

TC_44: Submit Feedback with Max Length (500 chars)

User Story ID: 11
Description: Verify feedback with 500 chars.
Preconditions: Logged in as patient, appointment completed.
Test Steps:
cy.intercept('POST', '/api/patients/feedback', { statusCode: 200, body: { success: true, message: 'Feedback submitted' } }).as('submitFeedback')
cy.visit('/patient/appointments')
cy.get('[data-testid="appointment-row-123"] [data-testid="feedback-button"]').click()
cy.get('[data-testid="feedback-input"]').type('A'.repeat(500))
cy.get('[data-testid="submit-button"]').click()
cy.wait('@submitFeedback')


Expected Result: Success message: “Feedback submitted”.
ECP: Valid feedback.
BVA: Feedback length = 500.
Priority: Low

TC_45: Submit Feedback with Overlength (501 chars)

User Story ID: 11
Description: Verify error for 501-char feedback.
Preconditions: Logged in as patient, appointment completed.
Test Steps:
cy.intercept('POST', '/api/patients/feedback', { statusCode: 400, body: { success: false, message: 'Feedback too long' } }).as('submitFeedback')
cy.visit('/patient/appointments')
cy.get('[data-testid="appointment-row-123"] [data-testid="feedback-button"]').click()
cy.get('[data-testid="feedback-input"]').type('A'.repeat(501))
cy.get('[data-testid="submit-button"]').click()
cy.wait('@submitFeedback')


Expected Result: Error message: “Feedback too long”.
ECP: Invalid feedback (overlength).
BVA: Feedback length = 501.
Priority: Low

TC_46: Assign Shift with Min Date (Tomorrow)

User Story ID: 4
Description: Verify shift assignment for tomorrow.
Preconditions: Logged in as admin, doctor exists.
Test Steps:
cy.intercept('POST', '/api/admin/shifts', { statusCode: 200, body: { success: true, message: 'Shift assigned' } }).as('assignShift')
cy.visit('/admin/shifts')
cy.get('[data-testid="doctor-select"]').select('Dr. John')
cy.get('[data-testid="date-input"]').type('2025-04-30')
cy.get('[data-testid="time-input"]').type('10:00')
cy.get('[data-testid="assign-button"]').click()
cy.wait('@assignShift')


Expected Result: Success message: “Shift assigned”.
ECP: Valid date.
BVA: Date = Tomorrow (2025-04-30).
Priority: High

TC_47: Approve Doctor with Large Credential File (2MB)

User Story ID: 2
Description: Verify approval with 2MB file.
Preconditions: Logged in as admin, doctor pending approval.
Test Steps:
cy.intercept('POST', '/api/admin/doctors/approve', { statusCode: 200, body: { success: true, message: 'Doctor approved' } }).as('approveDoctor')
cy.visit('/admin/pending-doctors')
cy.get('[data-testid="doctor-row-123"]').click()
cy.get('[data-testid="credentials-upload"]').attachFile('2mb.pdf')
cy.get('[data-testid="approve-button"]').click()
cy.wait('@approveDoctor')


Expected Result: Success message: “Doctor approved”.
ECP: Valid file size.
BVA: File size = 2MB.
Priority: Medium

TC_48: Approve Doctor with Oversized File (2.1MB)

User Story ID: 2
Description: Verify error for file > 2MB.
Preconditions: Logged in as admin, doctor pending approval.
Test Steps:
cy.intercept('POST', '/api/admin/doctors/approve', { statusCode: 400, body: { success: false, message: 'File too large' } }).as('approveDoctor')
cy.visit('/admin/pending-doctors')
cy.get('[data-testid="doctor-row-123"]').click()
cy.get('[data-testid="credentials-upload"]').attachFile('2.1mb.pdf')
cy.get('[data-testid="approve-button"]').click()
cy.wait('@approveDoctor')


Expected Result: Error message: “File too large”.
ECP: Invalid file size.
BVA: File size = 2.1MB.
Priority: Medium# Black Box Test Cases for Healthcare System

## Test Case Format
- **Test Case ID**: Unique identifier.
- **User Story ID**: Linked backlog item.
- **Description**: What the test validates.
- **Preconditions**: Setup required.
- **Test Steps**: Cypress commands.
- **Expected Result**: UI/API behavior.
- **ECP/BVA**: Partition or boundary tested.
- **Priority**: High/Medium/Low.

## Test Cases

### User Story 1: Update or Remove Doctor Profiles
**Acceptance Criteria**: Admin can update/remove doctor profiles and receive confirmation.

#### TC_01: Update Doctor Profile with Valid Data
- **User Story ID**: 1
- **Description**: Verify admin can update doctor’s name and specialty.
- **Preconditions**: Logged in as admin, doctor ID exists.
- **Test Steps**:
  1. `cy.intercept('PUT', '/api/admin/doctors/*', { statusCode: 200, body: { success: true, message: 'Doctor profile updated' } }).as('updateDoctor')`
  2. `cy.visit('/admin/doctors')`
  3. `cy.get('[data-testid="doctor-row-123"]').click()`
  4. `cy.get('[data-testid="first-name-input"]').clear().type('John')`
  5. `cy.get('[data-testid="specialty-input"]').clear().type('Cardiology')`
  6. `cy.get('[data-testid="update-button"]').click()`
  7. `cy.wait('@updateDoctor')`
- **Expected Result**: Success message: “Doctor profile updated”.
- **ECP**: Valid name (letters, 1–50 chars), valid specialty (text).
- **Priority**: Medium

#### TC_02: Update Doctor Profile with Invalid Name (Empty)
- **User Story ID**: 1
- **Description**: Verify error when updating with empty name.
- **Preconditions**: Logged in as admin, doctor ID exists.
- **Test Steps**:
  1. `cy.intercept('PUT', '/api/admin/doctors/*', { statusCode: 400, body: { success: false, message: 'Name is required' } }).as('updateDoctor')`
  2. `cy.visit('/admin/doctors')`
  3. `cy.get('[data-testid="doctor-row-123"]').click()`
  4. `cy.get('[data-testid="first-name-input"]').clear()`
  5. `cy.get('[data-testid="update-button"]').click()`
  6. `cy.wait('@updateDoctor')`
- **Expected Result**: Error message: “Name is required”.
- **ECP**: Invalid name (empty).
- **Priority**: Medium
- **BVA**: Name length = 0.

#### TC_03: Remove Doctor Profile
- **User Story ID**: 1
- **Description**: Verify admin can remove a doctor profile.
- **Preconditions**: Logged in as admin, doctor ID exists.
- **Test Steps**:
  1. `cy.intercept('DELETE', '/api/admin/doctors/*', { statusCode: 200, body: { success: true, message: 'Doctor removed' } }).as('deleteDoctor')`
  2. `cy.visit('/admin/doctors')`
  3. `cy.get('[data-testid="doctor-row-123"] [data-testid="delete-button"]').click()`
  4. `cy.get('[data-testid="confirm-delete"]').click()`
  5. `cy.wait('@deleteDoctor')`
- **Expected Result**: Success message: “Doctor removed”, doctor row disappears.
- **ECP**: Valid doctor ID.
- **Priority**: Medium

### User Story 2: Approve Doctors with Verified Credentials
**Acceptance Criteria**: Admin can review and approve doctors, granting system access.

#### TC_04: Approve Doctor with Valid Credentials
- **User Story ID**: 2
- **Description**: Verify admin can approve a doctor.
- **Preconditions**: Logged in as admin, doctor pending approval.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/admin/doctors/approve', { statusCode: 200, body: { success: true, message: 'Doctor approved' } }).as('approveDoctor')`
  2. `cy.visit('/admin/pending-doctors')`
  3. `cy.get('[data-testid="doctor-row-123"]').click()`
  4. `cy.get('[data-testid="credentials-file"]').should('contain', 'MD_Cert.pdf')`
  5. `cy.get('[data-testid="approve-button"]').click()`
  6. `cy.wait('@approveDoctor')`
- **Expected Result**: Success message: “Doctor approved”, doctor moves to active list.
- **ECP**: Valid credentials file (PDF).
- **Priority**: Medium

#### TC_05: Reject Doctor with Invalid Credentials (Empty File)
- **User Story ID**: 2
- **Description**: Verify error when approving without credentials.
- **Preconditions**: Logged in as admin, doctor pending approval.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/admin/doctors/approve', { statusCode: 400, body: { success: false, message: 'Credentials required' } }).as('approveDoctor')`
  2. `cy.visit('/admin/pending-doctors')`
  3. `cy.get('[data-testid="doctor-row-123"]').click()`
  4. `cy.get('[data-testid="approve-button"]').click()`
  5. `cy.wait('@approveDoctor')`
- **Expected Result**: Error message: “Credentials required”.
- **ECP**: Invalid credentials (empty).
- **Priority**: Medium
- **BVA**: File size = 0.

### User Story 3: Filter, View Assigned Shifts as a Doctor
**Acceptance Criteria**: Doctor sees past/current/future assigned shifts with date/time details.

#### TC_06: View Past Shifts
- **User Story ID**: 3
- **Description**: Verify doctor can filter and view past shifts.
- **Preconditions**: Logged in as doctor, past shifts exist.
- **Test Steps**:
  1. `cy.intercept('GET', '/api/doctors/shifts', { statusCode: 200, body: { success: true, data: [{ date: '2025-04-01', time: '10:00' }] } }).as('getShifts')`
  2. `cy.visit('/doctor/shifts')`
  3. `cy.get('[data-testid="past-filter"]').click()`
  4. `cy.wait('@getShifts')`
- **Expected Result**: Table shows shift on “2025-04-01, 10:00”.
- **ECP**: Valid filter (past).
- **Priority**: Medium

#### TC_07: View Future Shifts with Boundary Date
- **User Story ID**: 3
- **Description**: Verify doctor can view shifts on today’s date.
- **Preconditions**: Logged in as doctor, today’s shift exists.
- **Test Steps**:
  1. `cy.intercept('GET', '/api/doctors/shifts', { statusCode: 200, body: { success: true, data: [{ date: '2025-04-29', time: '14:00' }] } }).as('getShifts')`
  2. `cy.visit('/doctor/shifts')`
  3. `cy.get('[data-testid="current-filter"]').click()`
  4. `cy.wait('@getShifts')`
- **Expected Result**: Table shows shift on “2025-04-29, 14:00”.
- **ECP**: Valid filter (current).
- **BVA**: Date = Today (2025-04-29).
- **Priority**: Medium

### User Story 4: Assign Shifts to Doctors
**Acceptance Criteria**: Admin assigns shifts, and system updates doctor's schedule.

#### TC_08: Assign Shift with Valid Date/Time
- **User Story ID**: 4
- **Description**: Verify admin can assign a shift.
- **Preconditions**: Logged in as admin, doctor exists.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/admin/shifts', { statusCode: 200, body: { success: true, message: 'Shift assigned' } }).as('assignShift')`
  2. `cy.visit('/admin/shifts')`
  3. `cy.get('[data-testid="doctor-select"]').select('Dr. John')`
  4. `cy.get('[data-testid="date-input"]').type('2025-05-01')`
  5. `cy.get('[data-testid="time-input"]').type('10:00')`
  6. `cy.get('[data-testid="assign-button"]').click()`
  7. `cy.wait('@assignShift')`
- **Expected Result**: Success message: “Shift assigned”.
- **ECP**: Valid date (future), valid time (00:00–23:59).
- **Priority**: High

#### TC_09: Assign Shift with Invalid Date (Past)
- **User Story ID**: 4
- **Description**: Verify error for past date.
- **Preconditions**: Logged in as admin, doctor exists.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/admin/shifts', { statusCode: 400, body: { success: false, message: 'Date must be future' } }).as('assignShift')`
  2. `cy.visit('/admin/shifts')`
  3. `cy.get('[data-testid="doctor-select"]').select('Dr. John')`
  4. `cy.get('[data-testid="date-input"]').type('2025-04-01')`
  5. `cy.get('[data-testid="assign-button"]').click()`
  6. `cy.wait('@assignShift')`
- **Expected Result**: Error message: “Date must be future”.
- **ECP**: Invalid date (past).
- **BVA**: Date < Today.
- **Priority**: High

### User Story 5: Filter, View Available Doctors as a Patient
**Acceptance Criteria**: Patient searches for doctors by specialty/availability.

#### TC_10: Filter Doctors by Specialty
- **User Story ID**: 5
- **Description**: Verify patient can filter by specialty.
- **Preconditions**: Logged in as patient, doctors exist.
- **Test Steps**:
  1. `cy.intercept('GET', '/api/patients/doctors', { statusCode: 200, body: { success: true, data: [{ firstName: 'John', specialty: 'Cardiology' }] } }).as('getDoctors')`
  2. `cy.visit('/patient/doctors')`
  3. `cy.get('[data-testid="specialty-filter"]').select('Cardiology')`
  4. `cy.wait('@getDoctors')`
- **Expected Result**: Table shows “John” with “Cardiology”.
- **ECP**: Valid specialty.
- **Priority**: High

#### TC_11: Filter Doctors with Invalid Specialty
- **User Story ID**: 5
- **Description**: Verify no results for invalid specialty.
- **Preconditions**: Logged in as patient.
- **Test Steps**:
  1. `cy.intercept('GET', '/api/patients/doctors', { statusCode: 200, body: { success: true, data: [] } }).as('getDoctors')`
  2. `cy.visit('/patient/doctors')`
  3. `cy.get('[data-testid="specialty-filter"]').select('Invalid')`
  4. `cy.wait('@getDoctors')`
- **Expected Result**: “No doctors found” message.
- **ECP**: Invalid specialty.
- **Priority**: High

### User Story 6: Register as a Patient
**Acceptance Criteria**: Patient fills form, gets registered, and receives login credentials.

#### TC_12: Register with Valid Data
- **User Story ID**: 6
- **Description**: Verify successful patient registration.
- **Preconditions**: Not logged in.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/auth/register', { statusCode: 201, body: { success: true, message: 'User registered' } }).as('register')`
  2. `cy.visit('/login')`
  3. `cy.get('[data-testid="signup-link"]').click()`
  4. `cy.get('[data-testid="first-name-input"]').type('John')`
  5. `cy.get('[data-testid="email-input"]').type('john@clinic.com')`
  6. `cy.get('[data-testid="password-input"]').type('Password123')`
  7. `cy.get('[data-testid="submit-button"]').click()`
  8. `cy.wait('@register')`
- **Expected Result**: Success message: “User registered”.
- **ECP**: Valid name, email, password.
- **Priority**: High

#### TC_13: Register with Invalid Email
- **User Story ID**: 6
- **Description**: Verify error for invalid email format.
- **Preconditions**: Not logged in.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/auth/register', { statusCode: 400, body: { success: false, message: 'Invalid email' } }).as('register')`
  2. `cy.visit('/login')`
  3. `cy.get('[data-testid="signup-link"]').click()`
  4. `cy.get('[data-testid="first-name-input"]').type('John')`
  5. `cy.get('[data-testid="email-input"]').type('invalid')`
  6. `cy.get('[data-testid="password-input"]').type('Password123')`
  7. `cy.get('[data-testid="submit-button"]').click()`
  8. `cy.wait('@register')`
- **Expected Result**: Error message: “Invalid email”.
- **ECP**: Invalid email format.
- **Priority**: High

#### TC_14: Register with Short Password
- **User Story ID**: 6
- **Description**: Verify error for password < 6 chars.
- **Preconditions**: Not logged in.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/auth/register', { statusCode: 400, body: { success: false, message: 'Password too short' } }).as('register')`
  2. `cy.visit('/login')`
  3. `cy.get('[data-testid="signup-link"]').click()`
  4. `cy.get('[data-testid="first-name-input"]').type('John')`
  5. `cy.get('[data-testid="email-input"]').type('john@clinic.com')`
  6. `cy.get('[data-testid="password-input"]').type('Pass')`
  7. `cy.get('[data-testid="submit-button"]').click()`
  8. `cy.wait('@register')`
- **Expected Result**: Error message: “Password too short”.
- **ECP**: Invalid password (length < 6).
- **BVA**: Password length = 5.
- **Priority**: High

### User Story 7: Schedule an Appointment
**Acceptance Criteria**: Patient selects doctor/time, appointment is confirmed.

#### TC_15: Schedule Appointment with Valid Slot
- **User Story ID**: 7
- **Description**: Verify patient can book an appointment.
- **Preconditions**: Logged in as patient, doctor available.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/patients/appointments', { statusCode: 200, body: { success: true, message: 'Appointment booked' } }).as('bookAppointment')`
  2. `cy.visit('/patient/doctors')`
  3. `cy.get('[data-testid="doctor-row-123"] [data-testid="book-button"]').click()`
  4. `cy.get('[data-testid="date-picker"]').type('2025-05-01')`
  5. `cy.get('[data-testid="time-select"]').select('10:00')`
  6. `cy.get('[data-testid="submit-button"]').click()`
  7. `cy.wait('@bookAppointment')`
- **Expected Result**: Success message: “Appointment booked”.
- **ECP**: Valid date, time.
- **Priority**: High

#### TC_16: Schedule Appointment with Past Date
- **User Story ID**: 7
- **Description**: Verify error for past date.
- **Preconditions**: Logged in as patient, doctor available.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/patients/appointments', { statusCode: 400, body: { success: false, message: 'Invalid date' } }).as('bookAppointment')`
  2. `cy.visit('/patient/doctors')`
  3. `cy.get('[data-testid="doctor-row-123"] [data-testid="book-button"]').click()`
  4. `cy.get('[data-testid="date-picker"]').type('2025-04-01')`
  5. `cy.get('[data-testid="submit-button"]').click()`
  6. `cy.wait('@bookAppointment')`
- **Expected Result**: Error message: “Invalid date”.
- **ECP**: Invalid date (past).
- **BVA**: Date < Today.
- **Priority**: High

### User Story 8: Cancel an Appointment
**Acceptance Criteria**: Patient cancels appointment, slot becomes available.

#### TC_17: Cancel Upcoming Appointment
- **User Story ID**: 8
- **Description**: Verify patient can cancel an appointment.
- **Preconditions**: Logged in as patient, appointment exists.
- **Test Steps**:
  1. `cy.intercept('DELETE', '/api/patients/appointments/*', { statusCode: 200, body: { success: true, message: 'Appointment canceled' } }).as('cancelAppointment')`
  2. `cy.visit('/patient/appointments')`
  3. `cy.get('[data-testid="appointment-row-123"] [data-testid="cancel-button"]').click()`
  4. `cy.get('[data-testid="confirm-cancel"]').click()`
  5. `cy.wait('@cancelAppointment')`
- **Expected Result**: Success message: “Appointment canceled”, slot removed.
- **ECP**: Valid appointment ID.
- **Priority**: Medium

#### TC_18: Cancel Non-Existent Appointment
- **User Story ID**: 8
- **Description**: Verify error for invalid appointment ID.
- **Preconditions**: Logged in as patient.
- **Test Steps**:
  1. `cy.intercept('DELETE', '/api/patients/appointments/*', { statusCode: 404, body: { success: false, message: 'Appointment not found' } }).as('cancelAppointment')`
  2. `cy.visit('/patient/appointments')`
  3. `cy.request('DELETE', '/api/patients/appointments/999')` // Simulate invalid ID
  4. `cy.wait('@cancelAppointment')`
- **Expected Result**: Error message: “Appointment not found”.
- **ECP**: Invalid appointment ID.
- **Priority**: Medium

### User Story 9: Filter, View Upcoming Appointments as a Doctor
**Acceptance Criteria**: Doctor sees upcoming appointments with patient details.

#### TC_19: View Upcoming Appointments
- **User Story ID**: 9
- **Description**: Verify doctor can view upcoming appointments.
- **Preconditions**: Logged in as doctor, appointments exist.
- **Test Steps**:
  1. `cy.intercept('GET', '/api/doctors/appointments', { statusCode: 200, body: { success: true, data: [{ patient: 'John', date: '2025-05-01' }] } }).as('getAppointments')`
  2. `cy.visit('/doctor/appointments')`
  3. `cy.get('[data-testid="upcoming-filter"]').click()`
  4. `cy.wait('@getAppointments')`
- **Expected Result**: Table shows appointment with “John, 2025-05-01”.
- **ECP**: Valid filter (upcoming).
- **Priority**: Medium

#### TC_20: No Upcoming Appointments
- **User Story ID**: 9
- **Description**: Verify message when no appointments exist.
- **Preconditions**: Logged in as doctor.
- **Test Steps**:
  1. `cy.intercept('GET', '/api/doctors/appointments', { statusCode: 200, body: { success: true, data: [] } }).as('getAppointments')`
  2. `cy.visit('/doctor/appointments')`
  3. `cy.get('[data-testid="upcoming-filter"]').click()`
  4. `cy.wait('@getAppointments')`
- **Expected Result**: “No appointments found” message.
- **ECP**: Empty result set.
- **Priority**: Medium

### User Story 10: Filter, View Past and Upcoming Appointments as a Patient
**Acceptance Criteria**: Patient sees past/future appointments, data is accurate.

#### TC_21: View Past Appointments
- **User Story ID**: 10
- **Description**: Verify patient can view past appointments.
- **Preconditions**: Logged in as patient, past appointments exist.
- **Test Steps**:
  1. `cy.intercept('GET', '/api/patients/appointments', { statusCode: 200, body: { success: true, data: [{ doctor: 'John', date: '2025-04-01' }] } }).as('getAppointments')`
  2. `cy.visit('/patient/appointments')`
  3. `cy.get('[data-testid="past-filter"]').click()`
  4. `cy.wait('@getAppointments')`
- **Expected Result**: Table shows appointment with “John, 2025-04-01”.
- **ECP**: Valid filter (past).
- **Priority**: High

#### TC_22: View Upcoming Appointments with Boundary Date
- **User Story ID**: 10
- **Description**: Verify patient can view appointment on today.
- **Preconditions**: Logged in as patient, today’s appointment exists.
- **Test Steps**:
  1. `cy.intercept('GET', '/api/patients/appointments', { statusCode: 200, body: { success: true, data: [{ doctor: 'John', date: '2025-04-29' }] } }).as('getAppointments')`
  2. `cy.visit('/patient/appointments')`
  3. `cy.get('[data-testid="upcoming-filter"]').click()`
  4. `cy.wait('@getAppointments')`
- **Expected Result**: Table shows appointment with “John, 2025-04-29”.
- **ECP**: Valid filter (upcoming).
- **BVA**: Date = Today.
- **Priority**: High

### User Story 11: Submit Feedback After an Appointment
**Acceptance Criteria**: Patient submits feedback, stored in system.

#### TC_23: Submit Valid Feedback
- **User Story ID**: 11
- **Description**: Verify patient can submit feedback.
- **Preconditions**: Logged in as patient, appointment completed.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/patients/feedback', { statusCode: 200, body: { success: true, message: 'Feedback submitted' } }).as('submitFeedback')`
  2. `cy.visit('/patient/appointments')`
  3. `cy.get('[data-testid="appointment-row-123"] [data-testid="feedback-button"]').click()`
  4. `cy.get('[data-testid="feedback-input"]').type('Great service')`
  5. `cy.get('[data-testid="submit-button"]').click()`
  6. `cy.wait('@submitFeedback')`
- **Expected Result**: Success message: “Feedback submitted”.
- **ECP**: Valid feedback (1–500 chars).
- **Priority**: Low

#### TC_24: Submit Empty Feedback
- **User Story ID**: 11
- **Description**: Verify error for empty feedback.
- **Preconditions**: Logged in as patient, appointment completed.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/patients/feedback', { statusCode: 400, body: { success: false, message: 'Feedback required' } }).as('submitFeedback')`
  2. `cy.visit('/patient/appointments')`
  3. `cy.get('[data-testid="appointment-row-123"] [data-testid="feedback-button"]').click()`
  4. `cy.get('[data-testid="submit-button"]').click()`
  5. `cy.wait('@submitFeedback')`
- **Expected Result**: Error message: “Feedback required”.
- **ECP**: Invalid feedback (empty).
- **BVA**: Feedback length = 0.
- **Priority**: Low

### User Story 12: Update & View Feedback as a Doctor
**Acceptance Criteria**: Doctor sees patient comments and ratings, acknowledges it.

#### TC_25: View Patient Feedback
- **User Story ID**: 12
- **Description**: Verify doctor can view feedback.
- **Preconditions**: Logged in as doctor, feedback exists.
- **Test Steps**:
  1. `cy.intercept('GET', '/api/doctors/feedback', { statusCode: 200, body: { success: true, data: [{ patient: 'John', comment: 'Great' }] } }).as('getFeedback')`
  2. `cy.visit('/doctor/feedback')`
  3. `cy.wait('@getFeedback')`
- **Expected Result**: Table shows “John, Great”.
- **ECP**: Valid feedback data.
- **Priority**: Low

#### TC_26: Acknowledge Feedback
- **User Story ID**: 12
- **Description**: Verify doctor can acknowledge feedback.
- **Preconditions**: Logged in as doctor, feedback exists.
- **Test Steps**:
  1. `cy.intercept('PUT', '/api/doctors/feedback/*', { statusCode: 200, body: { success: true, message: 'Feedback acknowledged' } }).as('acknowledgeFeedback')`
  2. `cy.visit('/doctor/feedback')`
  3. `cy.get('[data-testid="feedback-row-123"] [data-testid="acknowledge-button"]').click()`
  4. `cy.wait('@acknowledgeFeedback')`
- **Expected Result**: Success message: “Feedback acknowledged”.
- **ECP**: Valid feedback ID.
- **Priority**: Low

### User Story 13: View Consultation Fee Online
**Acceptance Criteria**: Patient sees bill in payment section.

#### TC_27: View Consultation Fee
- **User Story ID**: 13
- **Description**: Verify patient can view fee.
- **Preconditions**: Logged in as patient, appointment exists.
- **Test Steps**:
  1. `cy.intercept('GET', '/api/patients/payments', { statusCode: 200, body: { success: true, data: [{ fee: 100 }] } }).as('getPayments')`
  2. `cy.visit('/patient/payments')`
  3. `cy.wait('@getPayments')`
- **Expected Result**: Table shows fee “$100”.
- **ECP**: Valid fee data.
- **Priority**: Medium

#### TC_28: View Zero Fee (Boundary)
- **User Story ID**: 13
- **Description**: Verify patient can view $0 fee.
- **Preconditions**: Logged in as patient, appointment exists.
- **Test Steps**:
  1. `cy.intercept('GET', '/api/patients/payments', { statusCode: 200, body: { success: true, data: [{ fee: 0 }] } }).as('getPayments')`
  2. `cy.visit('/patient/payments')`
  3. `cy.wait('@getPayments')`
- **Expected Result**: Table shows fee “$0”.
- **ECP**: Valid fee (0).
- **BVA**: Fee = 0.
- **Priority**: Medium

### User Story 14: Reschedule an Appointment
**Acceptance Criteria**: Patient selects new time, system updates appointment.

#### TC_29: Reschedule Appointment with Valid Slot
- **User Story ID**: 14
- **Description**: Verify patient can reschedule.
- **Preconditions**: Logged in as patient, appointment exists.
- **Test Steps**:
  1. `cy.intercept('PUT', '/api/patients/appointments/*', { statusCode: 200, body: { success: true, message: 'Appointment rescheduled' } }).as('rescheduleAppointment')`
  2. `cy.visit('/patient/appointments')`
  3. `cy.get('[data-testid="appointment-row-123"] [data-testid="reschedule-button"]').click()`
  4. `cy.get('[data-testid="date-picker"]').type('2025-05-02')`
  5. `cy.get('[data-testid="time-select"]').select('11:00')`
  6. `cy.get('[data-testid="submit-button"]').click()`
  7. `cy.wait('@rescheduleAppointment')`
- **Expected Result**: Success message: “Appointment rescheduled”.
- **ECP**: Valid date, time.
- **Priority**: Low

#### TC_30: Reschedule with Past Date
- **User Story ID**: 14
- **Description**: Verify error for past date.
- **Preconditions**: Logged in as patient, appointment exists.
- **Test Steps**:
  1. `cy.intercept('PUT', '/api/patients/appointments/*', { statusCode: 400, body: { success: false, message: 'Invalid date' } }).as('rescheduleAppointment')`
  2. `cy.visit('/patient/appointments')`
  3. `cy.get('[data-testid="appointment-row-123"] [data-testid="reschedule-button"]').click()`
  4. `cy.get('[data-testid="date-picker"]').type('2025-04-01')`
  5. `cy.get('[data-testid="submit-button"]').click()`
  6. `cy.wait('@rescheduleAppointment')`
- **Expected Result**: Error message: “Invalid date”.
- **ECP**: Invalid date (past).
- **BVA**: Date < Today.
- **Priority**: Low

### User Story 15: Update Appointment Completion Status as a Doctor
**Acceptance Criteria**: Doctor marks appointment completed, availability updates.

#### TC_31: Mark Appointment as Completed
- **User Story ID**: 15
- **Description**: Verify doctor can mark appointment completed.
- **Preconditions**: Logged in as doctor, appointment exists.
- **Test Steps**:
  1. `cy.intercept('PUT', '/api/doctors/appointments/*/status', { statusCode: 200, body: { success: true, message: 'Appointment completed' } }).as('updateStatus')`
  2. `cy.visit('/doctor/appointments')`
  3. `cy.get('[data-testid="appointment-row-123"] [data-testid="complete-button"]').click()`
  4. `cy.wait('@updateStatus')`
- **Expected Result**: Success message: “Appointment completed”, status updates.
- **ECP**: Valid appointment ID.
- **Priority**: Medium

#### TC_32: Mark Non-Existent Appointment
- **User Story ID**: 15
- **Description**: Verify error for invalid appointment ID.
- **Preconditions**: Logged in as doctor.
- **Test Steps**:
  1. `cy.intercept('PUT', '/api/doctors/appointments/*/status', { statusCode: 404, body: { success: false, message: 'Appointment not found' } }).as('updateStatus')`
  2. `cy.request('PUT', '/api/doctors/appointments/999/status')`
  3. `cy.wait('@updateStatus')`
- **Expected Result**: Error message: “Appointment not found”.
- **ECP**: Invalid appointment ID.
- **Priority**: Medium

### User Story 16: Login/Register Pages
**Acceptance Criteria**: Any user can register or login.

#### TC_33: Login with Valid Credentials
- **User Story ID**: 16
- **Description**: Verify successful login.
- **Preconditions**: User registered.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/auth/login', { statusCode: 200, body: { success: true, token: 'mock-token' } }).as('login')`
  2. `cy.visit('/login')`
  3. `cy.get('[data-testid="email-input"]').type('john@clinic.com')`
  4. `cy.get('[data-testid="password-input"]').type('Password123')`
  5. `cy.get('[data-testid="login-button"]').click()`
  6. `cy.wait('@login')`
- **Expected Result**: Redirects to dashboard.
- **ECP**: Valid email, password.
- **Priority**: High

#### TC_34: Login with Invalid Password
- **User Story ID**: 16
- **Description**: Verify error for wrong password.
- **Preconditions**: User registered.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/auth/login', { statusCode: 401, body: { success: false, message: 'Invalid credentials' } }).as('login')`
  2. `cy.visit('/login')`
  3. `cy.get('[data-testid="email-input"]').type('john@clinic.com')`
  4. `cy.get('[data-testid="password-input"]').type('WrongPass')`
  5. `cy.get('[data-testid="login-button"]').click()`
  6. `cy.wait('@login')`
- **Expected Result**: Error message: “Invalid credentials”.
- **ECP**: Invalid password.
- **Priority**: High

#### TC_35: Login with Empty Email
- **User Story ID**: 16
- **Description**: Verify error for empty email.
- **Preconditions**: Not logged in.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/auth/login', { statusCode: 400, body: { success: false, message: 'Email required' } }).as('login')`
  2. `cy.visit('/login')`
  3. `cy.get('[data-testid="password-input"]').type('Password123')`
  4. `cy.get('[data-testid="login-button"]').click()`
  5. `cy.wait('@login')`
- **Expected Result**: Error message: “Email required”.
- **ECP**: Invalid email (empty).
- **BVA**: Email length = 0.
- **Priority**: High

#### Additional Test Cases for ECP and BVA
To reach 50+ test cases, I’ll add more scenarios for critical user stories (6, 7, 10, 16) focusing on ECP and BVA.

#### TC_36: Register with Max Length Name
- **User Story ID**: 6
- **Description**: Verify registration with 50-char name.
- **Preconditions**: Not logged in.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/auth/register', { statusCode: 201, body: { success: true, message: 'User registered' } }).as('register')`
  2. `cy.visit('/login')`
  3. `cy.get('[data-testid="signup-link"]').click()`
  4. `cy.get('[data-testid="first-name-input"]').type('A'.repeat(50))`
  5. `cy.get('[data-testid="email-input"]').type('john@clinic.com')`
  6. `cy.get('[data-testid="password-input"]').type('Password123')`
  7. `cy.get('[data-testid="submit-button"]').click()`
  8. `cy.wait('@register')`
- **Expected Result**: Success message: “User registered”.
- **ECP**: Valid name.
- **BVA**: Name length = 50.
- **Priority**: High

#### TC_37: Register with Overlength Name
- **User Story ID**: 6
- **Description**: Verify error for 51-char name.
- **Preconditions**: Not logged in.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/auth/register', { statusCode: 400, body: { success: false, message: 'Name too long' } }).as('register')`
  2. `cy.visit('/login')`
  3. `cy.get('[data-testid="signup-link"]').click()`
  4. `cy.get('[data-testid="first-name-input"]').type('A'.repeat(51))`
  5. `cy.get('[data-testid="email-input"]').type('john@clinic.com')`
  6. `cy.get('[data-testid="password-input"]').type('Password123')`
  7. `cy.get('[data-testid="submit-button"]').click()`
  8. `cy.wait('@register')`
- **Expected Result**: Error message: “Name too long”.
- **ECP**: Invalid name (overlength).
- **BVA**: Name length = 51.
- **Priority**: High

#### TC_38: Schedule Appointment with Max Time (23:59)
- **User Story ID**: 7
- **Description**: Verify booking at 23:59.
- **Preconditions**: Logged in as patient, doctor available.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/patients/appointments', { statusCode: 200, body: { success: true, message: 'Appointment booked' } }).as('bookAppointment')`
  2. `cy.visit('/patient/doctors')`
  3. `cy.get('[data-testid="doctor-row-123"] [data-testid="book-button"]').click()`
  4. `cy.get('[data-testid="date-picker"]').type('2025-05-01')`
  5. `cy.get('[data-testid="time-select"]').select('23:59')`
  6. `cy.get('[data-testid="submit-button"]').click()`
  7. `cy.wait('@bookAppointment')`
- **Expected Result**: Success message: “Appointment booked”.
- **ECP**: Valid time.
- **BVA**: Time = 23:59.
- **Priority**: High

#### TC_39: Schedule Appointment with Min Time (00:00)
- **User Story ID**: 7
- **Description**: Verify booking at 00:00.
- **Preconditions**: Logged in as patient, doctor available.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/patients/appointments', { statusCode: 200, body: { success: true, message: 'Appointment booked' } }).as('bookAppointment')`
  2. `cy.visit('/patient/doctors')`
  3. `cy.get('[data-testid="doctor-row-123"] [data-testid="book-button"]').click()`
  4. `cy.get('[data-testid="date-picker"]').type('2025-05-01')`
  5. `cy.get('[data-testid="time-select"]').select('00:00')`
  6. `cy.get('[data-testid="submit-button"]').click()`
  7. `cy.wait('@bookAppointment')`
- **Expected Result**: Success message: “Appointment booked”.
- **ECP**: Valid time.
- **BVA**: Time = 00:00.
- **Priority**: High

#### TC_40: View Appointments with Max Fee ($1000)
- **User Story ID**: 13
- **Description**: Verify patient can view $1000 fee.
- **Preconditions**: Logged in as patient, appointment exists.
- **Test Steps**:
  1. `cy.intercept('GET', '/api/patients/payments', { statusCode: 200, body: { success: true, data: [{ fee: 1000 }] } }).as('getPayments')`
  2. `cy.visit('/patient/payments')`
  3. `cy.wait('@getPayments')`
- **Expected Result**: Table shows fee “$1000”.
- **ECP**: Valid fee.
- **BVA**: Fee = 1000.
- **Priority**: Medium

#### TC_41: Register with Min Age (1)
- **User Story ID**: 6
- **Description**: Verify registration with age = 1.
- **Preconditions**: Not logged in.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/auth/register', { statusCode: 201, body: { success: true, message: 'User registered' } }).as('register')`
  2. `cy.visit('/login')`
  3. `cy.get('[data-testid="signup-link"]').click()`
  4. `cy.get('[data-testid="first-name-input"]').type('John')`
  5. `cy.get('[data-testid="email-input"]').type('john@clinic.com')`
  6. `cy.get('[data-testid="password-input"]').type('Password123')`
  7. `cy.get('[data-testid="age-input"]').type('1')`
  8. `cy.get('[data-testid="submit-button"]').click()`
  9. `cy.wait('@register')`
- **Expected Result**: Success message: “User registered”.
- **ECP**: Valid age.
- **BVA**: Age = 1.
- **Priority**: High

#### TC_42: Register with Max Age (150)
- **User Story ID**: 6
- **Description**: Verify registration with age = 150.
- **Preconditions**: Not logged in.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/auth/register', { statusCode: 201, body: { success: true, message: 'User registered' } }).as('register')`
  2. `cy.visit('/login')`
  3. `cy.get('[data-testid="signup-link"]').click()`
  4. `cy.get('[data-testid="first-name-input"]').type('John')`
  5. `cy.get('[data-testid="email-input"]').type('john@clinic.com')`
  6. `cy.get('[data-testid="password-input"]').type('Password123')`
  7. `cy.get('[data-testid="age-input"]').type('150')`
  8. `cy.get('[data-testid="submit-button"]').click()`
  9. `cy.wait('@register')`
- **Expected Result**: Success message: “User registered”.
- **ECP**: Valid age.
- **BVA**: Age = 150.
- **Priority**: High

#### TC_43: Register with Invalid Age (0)
- **User Story ID**: 6
- **Description**: Verify error for age = 0.
- **Preconditions**: Not logged in.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/auth/register', { statusCode: 400, body: { success: false, message: 'Invalid age' } }).as('register')`
  2. `cy.visit('/login')`
  3. `cy.get('[data-testid="signup-link"]').click()`
  4. `cy.get('[data-testid="first-name-input"]').type('John')`
  5. `cy.get('[data-testid="email-input"]').type('john@clinic.com')`
  6. `cy.get('[data-testid="password-input"]').type('Password123')`
  7. `cy.get('[data-testid="age-input"]').type('0')`
  8. `cy.get('[data-testid="submit-button"]').click()`
  9. `cy.wait('@register')`
- **Expected Result**: Error message: “Invalid age”.
- **ECP**: Invalid age.
- **BVA**: Age = 0.
- **Priority**: High

#### TC_44: Submit Feedback with Max Length (500 chars)
- **User Story ID**: 11
- **Description**: Verify feedback with 500 chars.
- **Preconditions**: Logged in as patient, appointment completed.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/patients/feedback', { statusCode: 200, body: { success: true, message: 'Feedback submitted' } }).as('submitFeedback')`
  2. `cy.visit('/patient/appointments')`
  3. `cy.get('[data-testid="appointment-row-123"] [data-testid="feedback-button"]').click()`
  4. `cy.get('[data-testid="feedback-input"]').type('A'.repeat(500))`
  5. `cy.get('[data-testid="submit-button"]').click()`
  6. `cy.wait('@submitFeedback')`
- **Expected Result**: Success message: “Feedback submitted”.
- **ECP**: Valid feedback.
- **BVA**: Feedback length = 500.
- **Priority**: Low

#### TC_45: Submit Feedback with Overlength (501 chars)
- **User Story ID**: 11
- **Description**: Verify error for 501-char feedback.
- **Preconditions**: Logged in as patient, appointment completed.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/patients/feedback', { statusCode: 400, body: { success: false, message: 'Feedback too long' } }).as('submitFeedback')`
  2. `cy.visit('/patient/appointments')`
  3. `cy.get('[data-testid="appointment-row-123"] [data-testid="feedback-button"]').click()`
  4. `cy.get('[data-testid="feedback-input"]').type('A'.repeat(501))`
  5. `cy.get('[data-testid="submit-button"]').click()`
  6. `cy.wait('@submitFeedback')`
- **Expected Result**: Error message: “Feedback too long”.
- **ECP**: Invalid feedback (overlength).
- **BVA**: Feedback length = 501.
- **Priority**: Low

#### TC_46: Assign Shift with Min Date (Tomorrow)
- **User Story ID**: 4
- **Description**: Verify shift assignment for tomorrow.
- **Preconditions**: Logged in as admin, doctor exists.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/admin/shifts', { statusCode: 200, body: { success: true, message: 'Shift assigned' } }).as('assignShift')`
  2. `cy.visit('/admin/shifts')`
  3. `cy.get('[data-testid="doctor-select"]').select('Dr. John')`
  4. `cy.get('[data-testid="date-input"]').type('2025-04-30')`
  5. `cy.get('[data-testid="time-input"]').type('10:00')`
  6. `cy.get('[data-testid="assign-button"]').click()`
  7. `cy.wait('@assignShift')`
- **Expected Result**: Success message: “Shift assigned”.
- **ECP**: Valid date.
- **BVA**: Date = Tomorrow (2025-04-30).
- **Priority**: High

#### TC_47: Approve Doctor with Large Credential File (2MB)
- **User Story ID**: 2
- **Description**: Verify approval with 2MB file.
- **Preconditions**: Logged in as admin, doctor pending approval.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/admin/doctors/approve', { statusCode: 200, body: { success: true, message: 'Doctor approved' } }).as('approveDoctor')`
  2. `cy.visit('/admin/pending-doctors')`
  3. `cy.get('[data-testid="doctor-row-123"]').click()`
  4. `cy.get('[data-testid="credentials-upload"]').attachFile('2mb.pdf')`
  5. `cy.get('[data-testid="approve-button"]').click()`
  6. `cy.wait('@approveDoctor')`
- **Expected Result**: Success message: “Doctor approved”.
- **ECP**: Valid file size.
- **BVA**: File size = 2MB.
- **Priority**: Medium

#### TC_48: Approve Doctor with Oversized File (2.1MB)
- **User Story ID**: 2
- **Description**: Verify error for file > 2MB.
- **Preconditions**: Logged in as admin, doctor pending approval.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/admin/doctors/approve', { statusCode: 400, body: { success: false, message: 'File too large' } }).as('approveDoctor')`
  2. `cy.visit('/admin/pending-doctors')`
  3. `cy.get('[data-testid="doctor-row-123"]').click()`
  4. `cy.get('[data-testid="credentials-upload"]').attachFile('2.1mb.pdf')`
  5. `cy.get('[data-testid="approve-button"]').click()`
  6. `cy.wait('@approveDoctor')`
- **Expected Result**: Error message: “File too large”.
- **ECP**: Invalid file size.
- **BVA**: File size = 2.1MB.
- **Priority**: Medium

#### TC_49: Filter Doctors by Availability (Today)
- **User Story ID**: 5
- **Description**: Verify filtering doctors available today.
- **Preconditions**: Logged in as patient, doctors exist.
- **Test Steps**:
  1. `cy.intercept('GET', '/api/patients/doctors', { statusCode: 200, body: { success: true, data: [{ firstName: 'John', available: '2025-04-29' }] } }).as('getDoctors')`
  2. `cy.visit('/patient/doctors')`
  3. `cy.get('[data-testid="availability-filter"]').select('Today')`
  4. `cy.wait('@getDoctors')`
- **Expected Result**: Table shows “John” available on “2025-04-29”.
- **ECP**: Valid availability filter.
- **BVA**: Date = Today.
- **Priority**: High

#### TC_50: Login with Max Length Password (50 chars)
- **User Story ID**: 16
- **Description**: Verify login with 50-char password.
- **Preconditions**: User registered.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/auth/login', { statusCode: 200, body: { success: true, token: 'mock-token' } }).as('login')`
  2. `cy.visit('/login')`
  3. `cy.get('[data-testid="email-input"]').type('john@clinic.com')`
  4. `cy.get('[data-testid="password-input"]').type('A'.repeat(50))`
  5. `cy.get('[data-testid="login-button"]').click()`
  6. `cy.wait('@login')`
- **Expected Result**: Redirects to dashboard.
- **ECP**: Valid password.
- **BVA**: Password length = 50.
- **Priority**: High

#### TC_51: Login with Overlength Password (51 chars)
- **User Story ID**: 16
- **Description**: Verify error for 51-char password.
- **Preconditions**: User registered.
- **Test Steps**:
  1. `cy.intercept('POST', '/api/auth/login', { statusCode: 400, body: { success: false, message: 'Password too long' } }).as('login')`
  2. `cy.visit('/login')`
  3. `cy.get('[data-testid="email-input"]').type('john@clinic.com')`
  4. `cy.get('[data-testid="password-input"]').type('A'.repeat(51))`
  5. `cy.get('[data-testid="login-button"]').click()`
  6. `cy.wait('@login')`
- **Expected Result**: Error message: “Password too long”.
- **ECP**: Invalid password (overlength).
- **BVA**: Password length = 51.
- **Priority**: High

TC_49: Filter Doctors by Availability (Today)

User Story ID: 5
Description: Verify filtering doctors available today.
Preconditions: Logged in as patient, doctors exist.
Test Steps:
cy.intercept('GET', '/api/patients/doctors', { statusCode: 200, body: { success: true, data: [{ firstName: 'John', available: '2025-04-29' }] } }).as('getDoctors')
cy.visit('/patient/doctors')
cy.get('[data-testid="availability-filter"]').select('Today')
cy.wait('@getDoctors')


Expected Result: Table shows “John” available on “2025-04-29”.
ECP: Valid availability filter.
BVA: Date = Today.
Priority: High

TC_50: Login with Max Length Password (50 chars)

User Story ID: 16
Description: Verify login with 50-char password.
Preconditions: User registered.
Test Steps:
cy.intercept('POST', '/api/auth/login', { statusCode: 200, body: { success: true, token: 'mock-token' } }).as('login')
cy.visit('/login')
cy.get('[data-testid="email-input"]').type('john@clinic.com')
cy.get('[data-testid="password-input"]').type('A'.repeat(50))
cy.get('[data-testid="login-button"]').click()
cy.wait('@login')


Expected Result: Redirects to dashboard.
ECP: Valid password.
BVA: Password length = 50.
Priority: High

TC_51: Login with Overlength Password (51 chars)

User Story ID: 16
Description: Verify error for 51-char password.
Preconditions: User registered.
Test Steps:
cy.intercept('POST', '/api/auth/login', { statusCode: 400, body: { success: false, message: 'Password too long' } }).as('login')
cy.visit('/login')
cy.get('[data-testid="email-input"]').type('john@clinic.com')
cy.get('[data-testid="password-input"]').type('A'.repeat(51))
cy.get('[data-testid="login-button"]').click()
cy.wait('@login')


Expected Result: Error message: “Password too long”.
ECP: Invalid password (overlength).
BVA: Password length = 51.
Priority: High

