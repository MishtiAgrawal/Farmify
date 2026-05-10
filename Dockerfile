FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install --production

# Bundle app source
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose the port the app runs on
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/weather', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD [ "npm", "start" ]
