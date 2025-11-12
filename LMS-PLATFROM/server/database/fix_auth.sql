-- Fix MariaDB Authentication Plugin Issue
-- Run this script in MariaDB to change the authentication plugin for your user
-- This fixes the "auth_gssapi_client not supported" error

-- Replace 'root' with your actual username if different
-- Replace 'localhost' with '%' if you need remote access

-- For root user
ALTER USER 'root'@'localhost' IDENTIFIED VIA mysql_native_password USING PASSWORD('your_password_here');

-- Or if you want to use the default password hashing
-- ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_password_here';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Verify the change
SELECT user, host, plugin FROM mysql.user WHERE user = 'root';

