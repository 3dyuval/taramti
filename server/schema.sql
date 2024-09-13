-- Create Address table first
CREATE TABLE Address (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(255),
  street VARCHAR(255),
  number VARCHAR(255)
);

-- Create DonationLocation table next, referencing Address
CREATE TABLE DonationLocation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  schedulingUrl VARCHAR(255) NOT NULL,
  addressId INT,
  FOREIGN KEY (addressId) REFERENCES Address(id)
);

-- Create DonationLocationDate table last, referencing DonationLocation
CREATE TABLE DonationLocationDate (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dateOpen BIGINT NOT NULL,
  dateClose BIGINT NOT NULL,
  donationLocationId INT,
  FOREIGN KEY (donationLocationId) REFERENCES DonationLocation(id)
);
