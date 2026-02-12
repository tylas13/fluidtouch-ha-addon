ARG BUILD_FROM
FROM $BUILD_FROM

# Install Node.js and required dependencies
RUN apk add --no-cache \
    nodejs \
    npm \
    python3 \
    make \
    g++ \
    git

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy application files
COPY server/ ./server/
COPY public/ ./public/

# Expose port
EXPOSE 8099

# Set environment variables
ENV NODE_ENV=production

# Copy run script
COPY run.sh /
RUN chmod a+x /run.sh

# Run the application
CMD [ "/run.sh" ]
