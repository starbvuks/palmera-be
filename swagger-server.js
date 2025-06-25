const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger-unified.yaml'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customSiteTitle: 'Palmera API Documentation'
}));

app.listen(PORT, () => {
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
});