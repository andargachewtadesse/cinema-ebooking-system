# Bulldawgs Cinema

A full-stack movie ticket booking application built with Next.js, Spring Boot, and MySQL.

## Prerequisites

- Node.js (v18 or higher)
- Java JDK (v17 or higher)
- Maven
- MySQL

## Setup Instructions

### 1. Database Setup

1. Start MySQL and log in:
```bash
mysql -u root -p
```

2. Create the database:
```sql
CREATE DATABASE cinemadb;
USE cinemadb;
```

3. Create the necessary tables:
```sql

CREATE TABLE IF NOT EXISTS UserStatus (
    status_id INT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL
);

INSERT INTO UserStatus (status_id, status_name) 
VALUES (1, 'Active'), (2, 'Inactive')
ON DUPLICATE KEY UPDATE status_name=VALUES(status_name);

CREATE TABLE IF NOT EXISTS movies (
    movie_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    cast TEXT NOT NULL,
    director VARCHAR(255) NOT NULL,
    producer VARCHAR(255) NOT NULL,
    synopsis TEXT NOT NULL,
    reviews TEXT,
    trailer_picture VARCHAR(255) NOT NULL,
    trailer_video VARCHAR(255) NOT NULL,
    mpaa_rating VARCHAR(10) NOT NULL,
    status VARCHAR(50) DEFAULT 'Coming Soon'
);

CREATE TABLE IF NOT EXISTS show_times (
    show_time_id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    screen_number INT NOT NULL,
    available_seats INT NOT NULL,
    price DECIMAL(6,2) NOT NULL,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    status_id INT DEFAULT 2,
    promotion_subscription BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(64),
    street_address VARCHAR(255) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    state VARCHAR(50) DEFAULT NULL,
    zip_code VARCHAR(20) DEFAULT NULL,
    FOREIGN KEY (status_id) REFERENCES UserStatus(status_id)
);

CREATE TABLE IF NOT EXISTS card (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cardholder_name VARCHAR(255) NOT NULL,
    card_number VARCHAR(255) NOT NULL,
    cvv VARCHAR(255) NOT NULL,
    card_address VARCHAR(255) NOT NULL,
    expiration_date VARCHAR(10) NOT NULL,
    customer_id INT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES user(user_id) ON DELETE CASCADE
);

```

### 2. Backend Setup (Spring Boot)

1. Navigate to the backend directory:
```bash
cd cinema-backend
```

2. Update database credentials if needed:
   - Open `src/main/resources/application.properties`
   - The default configuration is:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cinemadb?useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=${MYSQL_PASSWORD:password}
```
   - You can either set the MYSQL_PASSWORD environment variable or directly replace the password

3. Build the Spring Boot application:
```bash
mvn clean package
```

4. Run the application with your MySQL password:
```bash
MYSQL_PASSWORD=your_password java -jar target/cinema-1.0-SNAPSHOT.jar
```
   - Replace `your_password` with your actual MySQL password

The backend server will start on `http://localhost:8080`

### 3. Frontend Setup (Next.js)

1. Navigate to the frontend directory:
```bash
cd ../
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend application will be available at `http://localhost:3000`

## Features

- Browse movies
- View movie details and trailers
- Select seats
- Book tickets
- Admin panel for managing movies and showtimes

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Spring Boot, Java
- **Database**: MySQL

