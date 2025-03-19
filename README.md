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
CREATE TABLE movies (
  movie_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  cast TEXT,
  director VARCHAR(255),
  producer VARCHAR(255),
  synopsis TEXT,
  reviews TEXT,
  trailer_picture VARCHAR(255),
  trailer_video VARCHAR(255),
  mpaa_rating VARCHAR(10),
  status VARCHAR(50)
);

CREATE TABLE show_times (
  show_time_id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT,
  show_date DATE,
  show_time TIME,
  screen_number INT,
  available_seats INT,
  price DECIMAL(10,2),
  FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE
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

