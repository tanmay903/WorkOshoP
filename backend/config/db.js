import mongoose from 'mongoose';

export const getDBStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    state: states[mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};

let retryTimer = null;

const scheduleReconnect = () => {
  if (retryTimer) return;
  retryTimer = setInterval(async () => {
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
      return;
    }
    const ok = await attemptConnect(true);
    if (ok && retryTimer) {
      clearInterval(retryTimer);
      retryTimer = null;
    }
  }, 15000);
};

const attemptConnect = async (quiet = false) => {
  const rawUri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.mongodm_uri ||
    'mongodb://127.0.0.1:27017/workoshop';

  const uri = rawUri.trim();

  if (uri.includes('<db_password>') || uri.includes('<password>')) {
    if (!quiet) {
      console.warn('MongoDB Connection Warning: MONGO_URI in backend/.env still contains the <db_password> placeholder.');
      console.warn('Replace <db_password> with your actual MongoDB Atlas password (or set MONGO_URI to your new cluster URI).');
    }
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host} (db: ${conn.connection.name})`);
    return true;
  } catch (error) {
    if (!quiet) {
      console.warn(`MongoDB Connection Warning: ${error.message}`);
      console.warn('Note: Check MONGO_URI in backend/.env and ensure IP whitelist / network access is allowed.');
    }
    return false;
  }
};

export const connectDB = async () => {
  const connected = await attemptConnect(false);
  if (!connected) {
    scheduleReconnect();
  }
  return connected;
};
