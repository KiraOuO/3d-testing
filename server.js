const express = require('express');
const axios = require('axios');
const app = express();

// Your existing server code...

app.get('/api/get-shoes', async (req, res) => {
    try {
        // Make a request to the external API (http://localhost:8080/api/get-cards in this case)
        const externalApiResponse = await axios.get('http://localhost:8080/api/get-cards');

        // Extract the relevant data from the response (adjust accordingly based on the actual response structure)
        const shoes = externalApiResponse.data;

        res.json(shoes);
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
