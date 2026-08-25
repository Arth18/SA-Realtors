FROM php:8.2-apache

# Enable mod_rewrite for htaccess rules
RUN a2enmod rewrite

# Copy site folder contents to Apache web root
COPY site/ /var/www/html/

# Set correct permissions so the PHP scripts can write to data/
RUN chown -R www-data:www-data /var/www/html && chmod -R 775 /var/www/html
