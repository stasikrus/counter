const express = require('express');
const redis = require('redis');

const app = express();

const PORT = process.env.PORT || 3001;

const redisClient = redis.createClient({
    host: 'redis', 
    port: 6379
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

app.use(express.json());

app.post('/counter/:bookId/incr', (req, res) => {
    const { bookId } = req.params;

    redisClient.incr(`book:${bookId}:count`, (err, newCount) => {
        if (err) {
            return res.status(500).send('Error incrementing counter')
        }

        res.send({bookId, count: newCount});
    });
});

app.get('/counter/:bookId', (req, res) => {
    const { bookId } = req.params;

    redisClient.get(`book:${bookId}:count`, (err, count) => {
        if (err) {
          return res.status(500).send('Error fetching counter');
        }

        res.send({ bookId, count: parseInt(count, 10) || 0 });

    });
});

app.listen(PORT, () => {
    console.log(`Counter app listening at http://localhost:${PORT}`);
});