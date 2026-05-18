FROM php:8.3-fpm

# System dependencies
RUN apt-get update \
    && apt-get install -y \
        git \
        unzip \
        libzip-dev \
        default-mysql-client \
        curl \
    && docker-php-ext-install pdo_mysql zip \
    && rm -rf /var/lib/apt/lists/*

# Composer
RUN curl -sS https://getcomposer.org/installer | php \
    && mv composer.phar /usr/local/bin/composer

WORKDIR /var/www

COPY . .

RUN chmod +x docker/entrypoint.sh

EXPOSE 8000

CMD ["sh", "docker/entrypoint.sh"]