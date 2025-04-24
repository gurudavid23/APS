process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const morgan = require('morgan');
const session = require('cookie-session');
const methodOverride = require('method-override');
const { SERVER_SESSION_SECRET, PORT } = require('./config.js');

const app = express();

app.set('view engine', 'ejs');
app.use(morgan('tiny'));

app.use(session({
  secret: SERVER_SESSION_SECRET,
  maxAge: 24 * 60 * 60 * 1000
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// ✅ ONLY USE token + static viewer
app.use(require('./routes/token.js'));

// ✅ Serve static viewer file
app.use(express.static('public'));

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).send('Something went wrong 😢');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
});
