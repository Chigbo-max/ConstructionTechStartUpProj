const express = require('express');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const bidRoutes = require('./routes/bids');
const milestoneRoutes = require('./routes/milestones');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/milestones', milestoneRoutes);

app.use((err, req, res, next) => {
    res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {});
};

module.exports = app;