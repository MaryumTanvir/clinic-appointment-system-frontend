describe('Healthcare System E2E Tests', () => {
    beforeEach(() => {
      // Clear local storage to ensure test independence
      cy.clearLocalStorage();
      // Mock login for authenticated routes
      cy.intercept('POST', '/api/auth/login', { statusCode: 200, body: { success: true, token: 'mock-token' } }).as('login');
      // Track handled request IDs (approved or rejected)
      let handledIds = [];
      const initialRequests = [
        {
          _id: '123',
          firstName: 'John',
          lastName: 'Doe',
          gender: 'Male',
          specialty: 'Cardiology',
          credentials: 'MD_Cert.pdf',
          email: 'john@clinic.com',
          status: 'pending',
        },
        {
          _id: '124',
          firstName: 'Jane',
          lastName: 'Smith',
          gender: 'Female',
          specialty: 'Neurology',
          credentials: 'Invalid_Cert',
          email: 'jane@clinic.com',
          status: 'pending',
        },
      ];
      // Mock GET requests dynamically
      cy.intercept('GET', '/api/admin/doctor-requests', (req) => {
        const filteredRequests = initialRequests.filter((req) => !handledIds.includes(req._id));
        req.reply({
          statusCode: 200,
          body: { success: true, data: filteredRequests },
        });
      }).as('getDoctorRequests');
      // Mock PUT requests for approve/reject
      cy.intercept('PUT', '/api/admin/doctor-requests/*/approve', (req) => {
        const id = req.url.split('/').pop();
        handledIds.push(id);
        req.reply({
          statusCode: 200,
          body: { success: true, message: 'Doctor approved' },
        });
      }).as('approveDoctor');
      cy.intercept('PUT', '/api/admin/doctor-requests/*/reject', (req) => {
        const id = req.url.split('/').pop();
        handledIds.push(id);
        req.reply({
          statusCode: 200,
          body: { success: true, message: 'Doctor rejected' },
        });
      }).as('rejectDoctor');


      // Mock GET shifts to avoid 401
    cy.intercept('GET', '/api/admin/shifts', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              _id: 'shift1',
              doctorId: { _id: 'doctor123', firstName: 'John', lastName: 'Doe' },
              date: '2025-04-01T00:00:00Z',
              startTime: '09:00',
              endTime: '17:00',
              shiftType: 'morning',
              location: 'Skin Ward',
            },
          ],
        },
      }).as('getShifts');

    });

  
    //User Story 2: Approve Doctors with Verified Credentials
    describe('User Story 2: Approve Doctors with Verified Credentials', () => {
      it('TC_04: Approve Doctor with Valid Credentials', () => {
        cy.visit('/admin/doctor-requests');
        cy.wait('@getDoctorRequests');
        // Ensure page 1 is active
        cy.get('button:contains("1")').click();
        // Verify the credentials in the row
        cy.get('table tbody tr:contains("MD_Cert.pdf") td:nth-child(5)')
          .contains('MD_Cert.pdf')
          .should('be.visible');
        // Click Approve
        cy.get('table tbody tr:contains("MD_Cert.pdf") td.flex button:contains("Approve")').click();
        cy.wait('@approveDoctor');
        cy.wait('@getDoctorRequests', { timeout: 10000 });
      });
  
      it('TC_05: Reject Doctor with Invalid Credentials (Empty)', () => {
        cy.visit('/admin/doctor-requests');
        cy.wait('@getDoctorRequests');
        cy.get('button:contains("1")').click();
        cy.get('table tbody tr:contains("Invalid_Cert") td:nth-child(5)')
          .contains('Invalid_Cert')
          .should('be.visible');
        cy.get('table tbody tr:contains("Invalid_Cert") td.flex button:contains("Reject")').click();
        cy.wait('@rejectDoctor');
        cy.wait('@getDoctorRequests', { timeout: 10000 });
      });
  
    });
  
     // User Story 3: Filter, View Assigned Shifts as a Doctor
  describe('User Story 3: Filter, View Assigned Shifts as a Doctor', () => {
    it('TC_06: View Past Shifts', () => {
      cy.intercept('GET', '/api/doctors/shifts?filter=past', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              _id: 'shift1',
              doctorId: 'doctor123',
              date: '2025-04-01T00:00:00Z',
              startTime: '09:00',
              endTime: '17:00',
              shiftType: 'morning',
              location: 'Skin Ward',
              createdBy: 'admin1',
              createdAt: '2025-04-01T00:00:00Z',
            },
          ],
        },
      }).as('getPastShifts');

      cy.visit('/doctor/shifts');
      cy.get('button:contains("Past")').click();
      cy.wait('@getPastShifts');
      // Verify table content
      cy.get('.ant-table-tbody tr').should('have.length', 1);
      cy.get('.ant-table-tbody td').contains('4/1/2025').should('be.visible');
      cy.get('.ant-table-tbody td').contains('09:00').should('be.visible');
      cy.get('.ant-table-tbody td').contains('17:00').should('be.visible');
      cy.get('.ant-table-tbody td').contains('Skin Ward').should('be.visible');
      cy.get('.ant-table-tbody td').contains('morning').should('be.visible');
      cy.get('.ant-table-tbody td').contains('Completed').should('be.visible');
    });

    it('TC_07: View Future Shifts with Boundary Date', () => {
      cy.intercept('GET', '/api/doctors/shifts?filter=future', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              _id: 'shift2',
              doctorId: 'doctor123',
              date: '2025-04-30T00:00:00Z',
              startTime: '09:00',
              endTime: '17:00',
              shiftType: 'morning',
              location: 'Skin Ward',
              createdBy: 'admin1',
              createdAt: '2025-04-29T00:00:00Z',
            },
          ],
        },
      }).as('getFutureShifts');

      cy.visit('/doctor/shifts');
      cy.get('button:contains("Future")').click();
      cy.wait('@getFutureShifts');
      cy.get('.ant-table-tbody tr').should('have.length', 1);
      cy.get('.ant-table-tbody td').contains('4/30/2025').should('be.visible');
      cy.get('.ant-table-tbody td').contains('09:00').should('be.visible');
      cy.get('.ant-table-tbody td').contains('17:00').should('be.visible');
      cy.get('.ant-table-tbody td').contains('Skin Ward').should('be.visible');
      cy.get('.ant-table-tbody td').contains('morning').should('be.visible');
      cy.get('.ant-table-tbody td').contains(/\d+ min left/).should('be.visible');
    });
  });

  // User Story 4: Assign Shifts to Doctors
  describe('User Story 4: Assign Shifts to Doctors', () => {
    beforeEach(() => {
      // Mock GET doctors for the doctor selection dropdown
      cy.intercept('GET', '/api/admin/doctors', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            { user: { _id: 'doctor123', firstName: 'John', lastName: 'Doe' }, specialty: 'Cardiology' },
            { user: { _id: 'doctor124', firstName: 'Jane', lastName: 'Smith' }, specialty: 'Neurology' },
          ],
        },
      }).as('getDoctors');
    });

    it('TC_08: Assign Shift with Valid Date/Time', () => {
      cy.intercept('POST', '/api/admin/assign-shift', {
        statusCode: 200,
        body: { success: true, message: 'Shift assigned successfully' },
      }).as('assignShift');

      cy.visit('/admin/shifts');
      cy.wait('@getShifts');
      cy.wait('@getDoctors');
      cy.get('button:contains("Assign Shift")').click();
      cy.get('select[name="doctorId"]').select('doctor123');
      cy.get('input[name="date"]').type('2025-05-01');
      cy.get('select[name="shiftType"]').select('morning');
      cy.get('input[name="location"]').type('Cardiology Ward');
      cy.get('[data-testid="Assign-btn"]').click();
      cy.wait('@assignShift');
      cy.get('.ant-notification-notice-message').contains('Success').should('be.visible');
      cy.get('.ant-notification-notice-description').contains('Shift assigned successfully').should('be.visible');
    });

    it('TC_09: Assign Shift with Invalid Date (Past)', () => {
      cy.intercept('POST', '/api/admin/assign-shift', {
        statusCode: 400,
        body: { success: false, message: 'Date must be in the future' },
      }).as('assignShift');

      cy.visit('/admin/shifts');
      cy.wait('@getShifts');
      cy.wait('@getDoctors');
      cy.get('button:contains("Assign Shift")').click();
      cy.get('select[name="doctorId"]').select('doctor123');
      cy.get('input[name="date"]').type('2025-04-01');
      cy.get('select[name="shiftType"]').select('morning');
      cy.get('input[name="location"]').type('Cardiology Ward');
      cy.get('[data-testid="Assign-btn"]').click();
      cy.wait('@assignShift');
      cy.get('.ant-notification-notice-message').contains('Cannot Assign Shift').should('be.visible');
      cy.get('.ant-notification-notice-description').contains('Date must be in the future').should('be.visible');
    });

    it('TC_46: Assign Shift with Min Date (Tomorrow)', () => {
      cy.intercept('POST', '/api/admin/assign-shift', {
        statusCode: 200,
        body: { success: true, message: 'Shift assigned successfully' },
      }).as('assignShift');

      cy.visit('/admin/shifts');
      cy.wait('@getShifts');
      cy.wait('@getDoctors');
      cy.get('button:contains("Assign Shift")').click();
      cy.get('select[name="doctorId"]').select('doctor123');
      cy.get('input[name="date"]').type('2025-04-30');
      cy.get('select[name="shiftType"]').select('morning');
      cy.get('input[name="location"]').type('Cardiology Ward');
      cy.get('[data-testid="Assign-btn"]').click();
      cy.wait('@assignShift');
      cy.get('.ant-notification-notice-message').contains('Success').should('be.visible');
      cy.get('.ant-notification-notice-description').contains('Shift assigned successfully').should('be.visible');
    });
  });

  
// User Story 5: Filter, View Available Doctors as a Patient
describe('User Story 5: Filter, View Available Doctors as a Patient', () => {
    beforeEach(() => {
      // Mock GET doctors with varied specialties, genders, and names
      cy.intercept('GET', '/api/patients/doctors', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              _id: 'doctor123',
              firstName: 'Areeba',
              lastName: 'Khan',
              gender: 'female',
              email: 'areeba@clinic.com',
              profile: {
                specialty: 'Dermatology',
                credentials: 'MBBS, FCPS',
                consultationFee: 2500,
                availability: [
                  { date: '2025-04-28', time: '10:00', available: true },
                  { date: '2025-04-29', time: '11:00', available: true },
                  { date: '2025-05-01', time: '09:00', available: false },
                ],
                contact: { phone: '03111234567', location: 'Skin Ward' },
              },
            },
            {
              _id: 'doctor124',
              firstName: 'Bilal',
              lastName: 'Rana',
              gender: 'male',
              email: 'bilal@clinic.com',
              profile: {
                specialty: 'Cardiology',
                credentials: 'MBBS, MD',
                consultationFee: 3000,
                availability: [
                  { date: '2025-04-29', time: '14:00', available: true },
                  { date: '2025-05-01', time: '17:00', available: true },
                ],
                contact: { phone: '03221234567', location: 'Cardiology Block' },
              },
            },
            {
              _id: 'doctor125',
              firstName: 'Mehwish',
              lastName: 'Tariq',
              gender: 'female',
              email: 'mehwish@clinic.com',
              profile: {
                specialty: 'Neurology',
                credentials: 'MBBS, MRCP',
                consultationFee: 3500,
                availability: [
                  { date: '2025-05-01', time: '01:00', available: true },
                ],
                contact: { phone: '03331234567', location: 'Neuro Wing' },
              },
            },
          ],
        },
      }).as('getDoctors');
    });

    it('TC_11: Filter Doctors with Invalid Specialty', () => {
      cy.visit('/patient/doctors');
      cy.wait('@getDoctors');
      // Verify initial table state
      cy.get('[data-testid="doctors-table"] .ant-table-tbody tr').should('have.length', 3);
      // Select a specialty not in the mock data
      cy.get('[data-testid="specialty-filter"]').click();
      cy.get('.ant-select-item-option-content').contains('Oncology').click();
      // Verify table is empty
      cy.get('[data-testid="doctors-table"] .ant-table-tbody td').contains('Areeba Khan').should('not.exist');
      cy.get('[data-testid="doctors-table"] .ant-table-tbody td').contains('Mehwish Tariq').should('not.exist');
      cy.get('[data-testid="doctors-table"] .ant-table-tbody td').contains('Bilal Rana').should('not.exist');});

    it('TC_49: Filter Doctors by Gender', () => {
      cy.visit('/patient/doctors');
      cy.wait('@getDoctors');
      // Verify initial table state (all doctors)
      cy.get('[data-testid="doctors-table"] .ant-table-tbody tr').should('have.length', 3);
      // Select Female gender filter
      cy.get('[data-testid="gender-filter"]').click();
      cy.get('.ant-select-item-option-content').contains('Female').click();
      // Verify only female doctors are shown
      cy.get('[data-testid="doctors-table"] .ant-table-tbody tr').should('have.length', 2);
      cy.get('[data-testid="doctors-table"] .ant-table-tbody td').contains('Areeba Khan').should('be.visible');
      cy.get('[data-testid="doctors-table"] .ant-table-tbody td').contains('Mehwish Tariq').should('be.visible');
      cy.get('[data-testid="doctors-table"] .ant-table-tbody td').contains('Bilal Rana').should('not.exist');
    });

    it('TC_50: Search Doctors by Name', () => {
      cy.visit('/patient/doctors');
      cy.wait('@getDoctors');
      // Verify initial table state (all doctors)
      cy.get('[data-testid="doctors-table"] .ant-table-tbody tr').should('have.length', 3);
      // Search by name (Areeba)
      cy.get('[data-testid="search-input"]').type('Areeba');
      // Verify only Areeba Khan is shown
      cy.get('[data-testid="doctors-table"] .ant-table-tbody tr').should('have.length', 1);
      cy.get('[data-testid="doctors-table"] .ant-table-tbody td').contains('Areeba Khan').should('be.visible');
      cy.get('[data-testid="doctors-table"] .ant-table-tbody td').contains('Bilal Rana').should('not.exist');
      cy.get('[data-testid="doctors-table"] .ant-table-tbody td').contains('Mehwish Tariq').should('not.exist');
    });
  });
  
    // User Story 6: Register as a Patient
    // User Story 6: Register as a Patient
  describe('User Story 6: Register as a Patient', () => {
    beforeEach(() => {
      // Ensure consistent starting point
      cy.clearLocalStorage();
    });

    it('TC_12: Register with Valid Data', () => {
      cy.intercept('POST', '/api/auth/signup', { statusCode: 201, body: { success: true, message: 'Registration successful!', user: { role: 'patient' }, token: 'mock-token' } }).as('register');
      cy.visit('/signup');
      cy.get('[data-testid="first-name-input"]').type('John');
      cy.get('[data-testid="last-name-input"]').type('Doe');
      cy.get('[data-testid="gender-select"]').click();
      cy.get('.ant-select-item-option-content').contains('Male').click();
      cy.get('[data-testid="role-select"]').click();
      cy.get('.ant-select-item-option-content').contains('Patient').click();
      cy.get('[data-testid="email-input"]').type('john@clinic.com');
      cy.get('[data-testid="password-input"]').type('Password123');
      cy.get('[data-testid="confirm-password-input"]').type('Password123');
      cy.get('[data-testid="phone-input"]').type('123-456-7890');
      cy.get('[data-testid="age-input"]').type('30');
      cy.get('[data-testid="medical-history-input"]').type('asthma, diabetes');
      cy.get('[data-testid="submit-button"]').click();
      cy.wait('@register');
      cy.get('.ant-message-notice-content').contains('Registration successful').should('be.visible');
    });

    it('TC_13: Register with Invalid Email', () => {
      cy.intercept('POST', '/api/auth/signup', { statusCode: 400, body: { success: false, message: 'Invalid email' } }).as('register');
      cy.visit('/signup');
      cy.get('[data-testid="first-name-input"]').type('John');
      cy.get('[data-testid="last-name-input"]').type('Doe');
      cy.get('[data-testid="gender-select"]').click();
      cy.get('.ant-select-item-option-content').contains('Male').click();
      cy.get('[data-testid="role-select"]').click();
      cy.get('.ant-select-item-option-content').contains('Patient').click();
      cy.get('[data-testid="email-input"]').type('invalid');
      cy.get('[data-testid="password-input"]').type('Password123');
      cy.get('[data-testid="confirm-password-input"]').type('Password123');
      cy.get('[data-testid="phone-input"]').type('123-456-7890');
      cy.get('[data-testid="age-input"]').type('30');
      cy.get('[data-testid="submit-button"]').click();
      cy.contains('Invalid email').should('be.visible');
    });

    it('TC_14: Register with Short Password', () => {
      cy.intercept('POST', '/api/auth/signup', { statusCode: 400, body: { success: false, message: 'Password must be at least 6 characters' } }).as('register');
      cy.visit('/signup');
      cy.get('[data-testid="first-name-input"]').type('John');
      cy.get('[data-testid="last-name-input"]').type('Doe');
      cy.get('[data-testid="gender-select"]').click();
      cy.get('.ant-select-item-option-content').contains('Male').click();
      cy.get('[data-testid="role-select"]').click();
      cy.get('.ant-select-item-option-content').contains('Patient').click();
      cy.get('[data-testid="email-input"]').type('john@clinic.com');
      cy.get('[data-testid="password-input"]').type('Pass');
      cy.get('[data-testid="confirm-password-input"]').type('Pass');
      cy.get('[data-testid="phone-input"]').type('123-456-7890');
      cy.get('[data-testid="age-input"]').type('30');
      cy.get('[data-testid="submit-button"]').click();
      cy.contains('Password must be at least 6 characters').should('be.visible');
    });

    it('TC_36: Register with Valid Name Characters', () => {
      cy.intercept('POST', '/api/auth/signup', { statusCode: 201, body: { success: true, message: 'Registration successful!', user: { role: 'patient' }, token: 'mock-token' } }).as('register');
      cy.visit('/signup');
      cy.get('[data-testid="first-name-input"]').type('John-Doe123');
      cy.get('[data-testid="last-name-input"]').type('Smith-Jones456');
      cy.get('[data-testid="gender-select"]').click();
      cy.get('.ant-select-item-option-content').contains('Male').click();
      cy.get('[data-testid="role-select"]').click();
      cy.get('.ant-select-item-option-content').contains('Patient').click();
      cy.get('[data-testid="email-input"]').type('john@clinic.com');
      cy.get('[data-testid="password-input"]').type('Password123');
      cy.get('[data-testid="confirm-password-input"]').type('Password123');
      cy.get('[data-testid="phone-input"]').type('123-456-7890');
      cy.get('[data-testid="age-input"]').type('30');
      cy.get('[data-testid="submit-button"]').click();
      cy.wait('@register');
      cy.get('.ant-message-notice-content').contains('Registration successful').should('be.visible');
    });

    it('TC_37: Register with Invalid Name Characters', () => {
      cy.intercept('POST', '/api/auth/signup', { statusCode: 400, body: { success: false, message: 'First Name must be at least 2 characters and contain valid characters' } }).as('register');
      cy.visit('/signup');
      cy.get('[data-testid="first-name-input"]').type('John@#');
      cy.get('[data-testid="last-name-input"]').type('Doe');
      cy.get('[data-testid="gender-select"]').click();
      cy.get('.ant-select-item-option-content').contains('Male').click();
      cy.get('[data-testid="role-select"]').click();
      cy.get('.ant-select-item-option-content').contains('Patient').click();
      cy.get('[data-testid="email-input"]').type('john@clinic.com');
      cy.get('[data-testid="password-input"]').type('Password123');
      cy.get('[data-testid="confirm-password-input"]').type('Password123');
      cy.get('[data-testid="phone-input"]').type('123-456-7890');
      cy.get('[data-testid="age-input"]').type('30');
      cy.get('[data-testid="submit-button"]').click();
      cy.contains('First Name must be at least 2 characters and contain valid characters').should('be.visible');
    });

    it('TC_41: Register with Min Age (0)', () => {
      cy.intercept('POST', '/api/auth/signup', { statusCode: 201, body: { success: true, message: 'Registration successful!', user: { role: 'patient' }, token: 'mock-token' } }).as('register');
      cy.visit('/signup');
      cy.get('[data-testid="first-name-input"]').type('John');
      cy.get('[data-testid="last-name-input"]').type('Doe');
      cy.get('[data-testid="gender-select"]').click();
      cy.get('.ant-select-item-option-content').contains('Male').click();
      cy.get('[data-testid="role-select"]').click();
      cy.get('.ant-select-item-option-content').contains('Patient').click();
      cy.get('[data-testid="email-input"]').type('john@clinic.com');
      cy.get('[data-testid="password-input"]').type('Password123');
      cy.get('[data-testid="confirm-password-input"]').type('Password123');
      cy.get('[data-testid="phone-input"]').type('123-456-7890');
      cy.get('[data-testid="age-input"]').type('0');
      cy.get('[data-testid="submit-button"]').click();
      cy.wait('@register');
      cy.get('.ant-message-notice-content').contains('Registration successful').should('be.visible');
    });

    it('TC_42: Register with Max Age (120)', () => {
      cy.intercept('POST', '/api/auth/signup', { statusCode: 201, body: { success: true, message: 'Registration successful!', user: { role: 'patient' }, token: 'mock-token' } }).as('register');
      cy.visit('/signup');
      cy.get('[data-testid="first-name-input"]').type('John');
      cy.get('[data-testid="last-name-input"]').type('Doe');
      cy.get('[data-testid="gender-select"]').click();
      cy.get('.ant-select-item-option-content').contains('Male').click();
      cy.get('[data-testid="role-select"]').click();
      cy.get('.ant-select-item-option-content').contains('Patient').click();
      cy.get('[data-testid="email-input"]').type('john@clinic.com');
      cy.get('[data-testid="password-input"]').type('Password123');
      cy.get('[data-testid="confirm-password-input"]').type('Password123');
      cy.get('[data-testid="phone-input"]').type('123-456-7890');
      cy.get('[data-testid="age-input"]').type('120');
      cy.get('[data-testid="submit-button"]').click();
      cy.wait('@register');
      cy.get('.ant-message-notice-content').contains('Registration successful').should('be.visible');
    });

    it('TC_43: Register with Invalid Age (150)', () => {
      cy.intercept('POST', '/api/auth/signup', { statusCode: 400, body: { success: false, message: 'Age must be an integer between 0 and 120' } }).as('register');
      cy.visit('/signup');
      cy.get('[data-testid="first-name-input"]').type('John');
      cy.get('[data-testid="last-name-input"]').type('Doe');
      cy.get('[data-testid="gender-select"]').click();
      cy.get('.ant-select-item-option-content').contains('Male').click();
      cy.get('[data-testid="role-select"]').click();
      cy.get('.ant-select-item-option-content').contains('Patient').click();
      cy.get('[data-testid="email-input"]').type('john@clinic.com');
      cy.get('[data-testid="password-input"]').type('Password123');
      cy.get('[data-testid="confirm-password-input"]').type('Password123');
      cy.get('[data-testid="phone-input"]').type('123-456-7890');
      cy.get('[data-testid="age-input"]').type('150');
      cy.contains('Age must be an integer between 0 and 120').should('be.visible');
    });
  });

  
  // User Story 7: Schedule an Appointment
  describe('User Story 7: Schedule an Appointment', () => {
    beforeEach(() => {
      // Mock GET doctors with varied specialties, genders, and availability
      cy.intercept('GET', '/api/patients/doctors', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              _id: 'doctor123',
              firstName: 'Areeba',
              lastName: 'Khan',
              gender: 'female',
              email: 'areeba@clinic.com',
              profile: {
                specialty: 'Dermatology',
                credentials: 'MBBS, FCPS',
                consultationFee: 2500,
                availability: [
                  { date: '2025-04-30', time: '10:00', available: true },
                  { date: '2025-05-28', time: '00:00', available: true },
                  { date: '2025-05-28', time: '23:59', available: true },
                  { date: '2025-05-29', time: '11:00', available: true },
                  { date: '2025-06-01', time: '09:00', available: false },
                ],
                contact: { phone: '03111234567', location: 'Skin Ward' },
              },
            },
            {
              _id: 'doctor124',
              firstName: 'Bilal',
              lastName: 'Rana',
              gender: 'male',
              email: 'bilal@clinic.com',
              profile: {
                specialty: 'Cardiology',
                credentials: 'MBBS, MD',
                consultationFee: 3000,
                availability: [
                  { date: '2025-04-29', time: '14:00', available: true },
                  { date: '2025-05-01', time: '17:00', available: true },
                ],
                contact: { phone: '03221234567', location: 'Cardiology Block' },
              },
            },
            {
              _id: 'doctor125',
              firstName: 'Mehwish',
              lastName: 'Tariq',
              gender: 'female',
              email: 'mehwish@clinic.com',
              profile: {
                specialty: 'Neurology',
                credentials: 'MBBS, MRCP',
                consultationFee: 3500,
                availability: [
                  { date: '2025-05-01', time: '01:00', available: true },
                ],
                contact: { phone: '03331234567', location: 'Neuro Wing' },
              },
            },
          ],
        },
      }).as('getDoctors');
    });



    it('TC_16: Schedule Appointment', () => {
      cy.intercept('POST', '/api/patients/appointments', { statusCode: 400, body: { success: false, message: 'Invalid date' } }).as('bookAppointment');
      cy.visit('/patient/doctors');
      cy.wait('@getDoctors');
      // Select first doctor (Areeba Khan)
      cy.get('[data-testid="doctors-table"] .ant-table-tbody tr').eq(0).find('[data-testid="book-appointment-button"]').click();
      // Verify booking modal
      cy.get('[data-testid="booking-modal"]').should('be.visible');
      // Try to select an unavailable date (not in availability)
      cy.get('[data-testid="date-picker"]').type('2025-05-02{enter}');
      // Date Figurative
      // DatePicker should disable it, so force submission with no date
      cy.get('[data-testid="submit-booking-button"]').click();
    });

  });
  
   // User Story 8: Cancel an Appointment
  describe('User Story 8: Cancel an Appointment', () => {
    beforeEach(() => {
      // Mock GET appointments
      cy.intercept('GET', '/api/patients/appointments?*', {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              _id: '123',
              doctorId: {
                _id: 'doctor123',
                firstName: 'Areeba',
                lastName: 'Khan',
              },
              date: '2025-05-28',
              time: '10:00',
              status: 'scheduled',
              notes: 'Follow-up visit',
            },
            {
              _id: '999',
              doctorId: {
                _id: 'doctor123',
                firstName: 'Areeba',
                lastName: 'Khan',
              },
              date: '2025-05-29',
              time: '11:00',
              status: 'scheduled',
              notes: '',
            },
          ],
        },
      }).as('getAppointments');
    });

    it('TC_17: Cancel Upcoming Appointment', () => {
      cy.intercept('PUT', '/api/patients/appointments/123/cancel', {
        statusCode: 200,
        body: { success: true, message: 'Appointment canceled' },
      }).as('cancelAppointment');
      cy.window().then(win => {
        win.localStorage.setItem('token', 'mock-token');
      });
      cy.visit('/patient/appointments');
      cy.wait('@getAppointments', { timeout: 10000 });
      cy.get('[data-testid="appointment-row-123"] [data-testid="cancel-button"]').click();
      cy.wait('@cancelAppointment');
      cy.get('.ant-message-notice-content').contains('Appointment canceled').should('be.visible');
    });

    it('TC_18: Cancel Non-Existent Appointment', () => {
      cy.intercept('PUT', '/api/patients/appointments/999/cancel', {
        statusCode: 404,
        body: { success: false, message: 'Appointment not found' },
      }).as('cancelAppointment');
      cy.window().then(win => {
        win.localStorage.setItem('token', 'mock-token');
      });
      cy.visit('/patient/appointments');
      cy.wait('@getAppointments', { timeout: 10000 });
      cy.get('[data-testid="appointment-row-999"] [data-testid="cancel-button"]').click();
      cy.wait('@cancelAppointment');
      cy.get('.ant-message-notice-content').contains('Appointment not found').should('be.visible');
    });
  });
  });