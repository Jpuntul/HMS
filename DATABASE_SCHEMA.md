# HMS Database Schema Documentation

> **Database**: `hms_db` (MySQL)
> **Last Updated**: October 12, 2025
> **Total Records**: 1,326 records across all tables

## 📊 Database Overview

| Entity       | Table          | Records | Purpose                |
| ------------ | -------------- | ------- | ---------------------- |
| 👤 People    | `Persons`      | 447     | Patient/Person records |
| 👩‍⚕️ Staff     | `Employees`    | 303     | Healthcare employees   |
| 🏥 Locations | `Facilities`   | 11      | Healthcare facilities  |
| 🦠 Health    | `Infections`   | 565     | Infection tracking     |
| 🏠 Housing   | `Residences`   | -       | Residence information  |
| 💉 Vaccines  | `Vaccinations` | -       | Vaccination records    |

---

## 🔑 Core Entity Tables

### 1. **Persons Table** (447 records)

```sql
CREATE TABLE Persons (
    SSN         INT UNIQUE,           -- Social Security Number
    Medicare    CHAR(12) PRIMARY KEY, -- Medicare ID (Primary Key)
    FirstName   VARCHAR(30) NOT NULL, -- First name
    LastName    VARCHAR(30) NOT NULL, -- Last name
    DOB         DATE NOT NULL,        -- Date of birth
    Telephone   CHAR(10) UNIQUE,      -- Phone number
    Citizenship VARCHAR(30),          -- Citizenship status
    Email       VARCHAR(320),         -- Email address
    Occupation  VARCHAR(30)           -- Job/occupation
);
```

**Sample Data:**
| SSN | Medicare | FirstName | LastName | DOB | Telephone | Citizenship | Email |
|-----|----------|-----------|----------|-----|-----------|-------------|-------|
| 202078693 | ABBR45321406 | Ruth | Abbott | 1992-01-15 | 4505106389 | Canadian | Ruth_Abbott1@yahoo.com |
| 312413745 | ABEK47549964 | Kendra | Abernathy | 1970-01-10 | 5145109064 | Canadian | Kendra_Abernathy@gmail.com |

### 2. **Employees Table** (303 records)

```sql
CREATE TABLE Employees (
    SSN  INT PRIMARY KEY,  -- Links to Persons.SSN
    Role ENUM(
        'nurse',
        'doctor',
        'cashier',
        'pharmacist',
        'receptionist',
        'administrative personnel',
        'security personnel',
        'regular employee'
    ) NOT NULL
);
```

### 3. **Facilities Table** (11 records)

```sql
CREATE TABLE Facilities (
    FID         INT PRIMARY KEY AUTO_INCREMENT, -- Facility ID
    Name        VARCHAR(50) UNIQUE NOT NULL,    -- Facility name
    Address     VARCHAR(100) NOT NULL,          -- Street address
    City        VARCHAR(50) NOT NULL,           -- City
    Province    VARCHAR(25) NOT NULL,           -- Province/State
    PostalCode  CHAR(6) NOT NULL,               -- Postal code
    PhoneNumber CHAR(10) UNIQUE NOT NULL,       -- Phone number
    WebAddress  VARCHAR(255) NOT NULL,          -- Website URL
    Type        ENUM(
        'Hospital',
        'CLSC',
        'Clinic',
        'Pharmacy',
        'Special installment'
    ) NOT NULL,
    Capacity    INT,                            -- Bed/patient capacity
    GMSSN       INT UNIQUE NOT NULL             -- General Manager SSN
);
```

**Facilities List:**
| FID | Name | Type | City | Capacity |
|-----|------|------|------|----------|
| 1 | Hospital Maisonneuve Rosemont | Hospital | Montreal | 250 |
| 2 | The Montreal Children's Hospital | Hospital | Montreal | 100 |
| 3 | St. Mary's Hospital Center | Hospital | Montreal | 150 |
| 4 | Montreal General Hospital | Hospital | Montreal | 175 |
| 5 | Hopital de Verdun | Hospital | Montreal | 210 |
| 6 | CLSC Sainte-Catherine | CLSC | Montreal | 50 |
| 7 | CLSC Metro | CLSC | Montreal | 40 |
| 8 | Jean Coutu Pharmacy | Pharmacy | Montreal | 30 |
| 9 | Greene Avenue Clinic | Clinic | Westmount | 30 |
| 10 | Passport Health Westmount | Special installment | Westmount | 20 |
| 22 | test | Special installment | test | 250 |

---

## 🏠 Housing & Location Tables

### 4. **Residences Table**

```sql
CREATE TABLE Residences (
    ResID        INT PRIMARY KEY AUTO_INCREMENT, -- Residence ID
    Address      VARCHAR(100) NOT NULL,          -- Street address
    City         VARCHAR(50) NOT NULL,           -- City
    Province     VARCHAR(25) NOT NULL,           -- Province
    PostalCode   CHAR(6) NOT NULL,               -- Postal code
    NoOfBedrooms INT,                            -- Number of bedrooms
    Type         ENUM(
        'apartment',
        'condominium',
        'semidetached house',
        'house'
    ) NOT NULL
);
```

---

## 💼 Employment & Scheduling Tables

### 5. **Employments Table** (Employee-Facility Relationships)

```sql
CREATE TABLE Employments (
    ESSN      INT NOT NULL,   -- Employee SSN
    FID       INT NOT NULL,   -- Facility ID
    StartDate DATE NOT NULL,  -- Employment start date
    EndDate   DATE,           -- Employment end date (NULL = current)
    PRIMARY KEY (ESSN, FID, StartDate),
    FOREIGN KEY (ESSN) REFERENCES Employees(SSN),
    FOREIGN KEY (FID) REFERENCES Facilities(FID)
);
```

### 6. **Schedules Table** (Employee Work Schedules)

```sql
CREATE TABLE Schedules (
    ESSN      INT NOT NULL,   -- Employee SSN
    FID       INT NOT NULL,   -- Facility ID
    Date      DATE NOT NULL,  -- Work date
    StartTime TIME NOT NULL,  -- Shift start time
    EndTime   TIME,           -- Shift end time
    PRIMARY KEY (ESSN, FID, Date, StartTime),
    FOREIGN KEY (ESSN) REFERENCES Employees(SSN),
    FOREIGN KEY (FID) REFERENCES Facilities(FID)
);
```

---

## 🦠 Health Tracking Tables

### 7. **Infections Table** (565 records)

```sql
CREATE TABLE Infections (
    SSN    INT NOT NULL,   -- Person's SSN
    Date   DATE NOT NULL,  -- Infection date
    TypeID INT NOT NULL,   -- Infection type ID
    PRIMARY KEY (SSN, Date, TypeID),
    FOREIGN KEY (SSN) REFERENCES Persons(SSN),
    FOREIGN KEY (TypeID) REFERENCES InfectionTypes(TypeID)
);
```

### 8. **InfectionTypes Table**

```sql
CREATE TABLE InfectionTypes (
    TypeID   INT PRIMARY KEY AUTO_INCREMENT, -- Infection type ID
    TypeName VARCHAR(50) UNIQUE NOT NULL     -- Infection name
);
```

---

## 💉 Vaccination System Tables

### 9. **Vaccinations Table**

```sql
CREATE TABLE Vaccinations (
    SSN      INT NOT NULL,   -- Person's SSN
    TypeID   INT NOT NULL,   -- Vaccine type ID
    Date     DATE NOT NULL,  -- Vaccination date
    NoOfDose INT,            -- Dose number (1st, 2nd, booster, etc.)
    FID      INT,            -- Facility where vaccinated
    PRIMARY KEY (SSN, TypeID, Date),
    FOREIGN KEY (SSN) REFERENCES Persons(SSN),
    FOREIGN KEY (TypeID) REFERENCES VaccineTypes(TypeID),
    FOREIGN KEY (FID) REFERENCES Facilities(FID)
);
```

### 10. **VaccineTypes Table**

```sql
CREATE TABLE VaccineTypes (
    TypeID   INT PRIMARY KEY AUTO_INCREMENT, -- Vaccine type ID
    TypeName VARCHAR(50) UNIQUE NOT NULL     -- Vaccine name
);
```

---

## 🔄 Django Integration Notes

### **Current Django Model vs MySQL Schema Differences:**

| Aspect          | Django (Current)          | MySQL (Target)          |
| --------------- | ------------------------- | ----------------------- |
| **Primary Key** | `id` (auto-increment)     | `Medicare` (char(12))   |
| **SSN Format**  | `CharField` with dashes   | `INT` without dashes    |
| **Name Fields** | `first_name`, `last_name` | `FirstName`, `LastName` |
| **Telephone**   | `CharField(15)`           | `CHAR(10)`              |
| **Table Name**  | `hms_person`              | `Persons`               |

### **Integration Checklist:**

- [ ] Update Django models to match MySQL schema
- [ ] Configure MySQL database connection
- [ ] Set `db_table = 'Persons'` in model Meta
- [ ] Handle SSN format conversion (string ↔ int)
- [ ] Create serializers for all related models
- [ ] Add foreign key relationships
- [ ] Test data migration from SQLite to MySQL

---

## 🔗 Relationship Mapping

```
Persons (SSN) ← 1:1 → Employees (SSN)
Employees (SSN) ← 1:M → Employments (ESSN)
Facilities (FID) ← 1:M → Employments (FID)
Employees (SSN) ← 1:M → Schedules (ESSN)
Facilities (FID) ← 1:M → Schedules (FID)
Persons (SSN) ← 1:M → Infections (SSN)
InfectionTypes (TypeID) ← 1:M → Infections (TypeID)
Persons (SSN) ← 1:M → Vaccinations (SSN)
VaccineTypes (TypeID) ← 1:M → Vaccinations (TypeID)
Facilities (FID) ← 1:M → Vaccinations (FID)
```

---

## 📝 Additional Tables in Database

The following Django-specific tables also exist:

- `auth_group`, `auth_group_permissions`, `auth_permission`
- `auth_user`, `auth_user_groups`, `auth_user_user_permissions`
- `django_admin_log`, `django_content_type`, `django_migrations`, `django_session`
- `hms_person` (our current Django model)
- `EmailLogs`, `Resides`, `ResidesWith` (additional relationship tables)

---

_This documentation serves as a comprehensive reference for the HMS database structure and will be updated as the system evolves._
