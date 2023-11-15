const express = require('express');
const redis = require('redis');

const app = express();

const PORT = process.env.PORT || 3001;
// const REDIS_URL = process.env.REDIS_URL || 'localhost';

const redisClient = redis.createClient({ url: 'redis://redis' });

redisClient.connect().then(() => {
    console.log("Connected to Redis");
    app.listen(PORT, () => {
        console.log(`Counter app listening at port ${PORT}`);
    });
}).catch(err => {
    console.error('Redis Client Error', err);
    process.exit(1); 
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

app.use(express.json());

app.post('/counter/:bookId/incr', async (req, res) => {
    const { bookId } = req.params;
    console.log(`Increment request received for bookId: ${bookId}`);

    try {
        const newCount = await redisClient.incr(`book:${bookId}:count`);
        console.log(`Counter incremented for bookId: ${bookId}, new count: ${newCount}`);
        res.send({ bookId, count: newCount });
    } catch (err) {
        console.error(`Error incrementing counter for bookId: ${bookId}`, err);
        res.status(500).send('Error incrementing counter');
    }
});


app.get('/counter/:bookId', async (req, res) => {
    const { bookId } = req.params;

    try {
        const count = await redisClient.get(`book:${bookId}:count`);
        res.send({ bookId, count: parseInt(count, 10) || 0 });
    } catch (err) {
        console.error(`Error fetching counter for bookId: ${bookId}`, err);
        res.status(500).send('Error fetching counter');
    }
});