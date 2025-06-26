// netlify/functions/get-products.js

const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY; // קורא את המפתח ממשתנה סביבה

exports.handler = async function(event, context) {
    if (!PRINTFUL_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Printful API Key is not configured." })
        };
    }

    try {
        const printfulApiUrl = 'https://api.printful.com/store/products';

        const response = await fetch(printfulApiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${PRINTFUL_API_KEY}`, // זה השינוי הנדרש!
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Printful API error (products) from Netlify Function:', response.status, errorData);
            return {
                statusCode: response.status,
                body: JSON.stringify({
                    error: `Failed to fetch products from Printful API. Status: ${response.status}`,
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
        console.error("Error in Netlify Function (get-products):", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error while fetching products.", details: error.message })
        };
    }
};
