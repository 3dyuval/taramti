-- Drop existing tables
DROP TABLE IF EXISTS DonationLocationDate;
DROP TABLE IF EXISTS DonationLocation;
DROP TABLE IF EXISTS Address;

-- Recreate tables with the updated schema
CREATE TABLE Address (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(255),
  street VARCHAR(255),
  number VARCHAR(255),
  UNIQUE (city, street, number)
);

CREATE TABLE DonationLocation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  schedulingUrl VARCHAR(255) NOT NULL,
  addressId INT,
  FOREIGN KEY (addressId) REFERENCES Address(id)
);

CREATE TABLE DonationLocationDate (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dateOpen BIGINT NOT NULL,
  dateClose BIGINT NOT NULL,
  donationLocationId INT,
  FOREIGN KEY (donationLocationId) REFERENCES DonationLocation(id),
  UNIQUE (dateOpen, dateClose, donationLocationId)
);