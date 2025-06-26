// netlify/functions/create-order.js

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY; // קורא את המפתח ממשתנה סביבה

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
            headers: { 'Allow': 'POST' }
        };
    }

    if (!PRINTFUL_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Printful API Key is not configured." })
        };
    }

    try {
        const orderPayload = JSON.parse(event.body); // קבל את ה-body של הבקשה מה-Frontend

        const printfulOrderApiUrl = 'https://api.printful.com/orders';

        const response = await fetch(printfulOrderApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PRINTFUL_API_KEY}`, // זה השינוי הנדרש!
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderPayload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Printful API error (create order) from Netlify Function:', response.status, errorData);
            return {
                statusCode: response.status,
                body: JSON.stringify({
                    error: `Failed to create Printful order. Status: ${response.status}`,
                    details: errorData
                })
            };
        }

        const data = await response.json();

        // הוסף כותרות CORS כדי שהדפדפן יוכל לקרוא את התשובה
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // אפשר גישה מכל מקור (לפיתוח)
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error("Error in Netlify Function (create-order):", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error while creating order.", details: error.message })
        };
    }
};
