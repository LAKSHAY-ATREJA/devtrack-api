const { randomUUID } = require('crypto');

const requestId = (req, res, next) => {
  const incoming = req.get('x-request-id');
  const id = incoming && incoming.trim() ? incoming.trim() : randomUUID();

  req.id = id;
  res.setHeader('x-request-id', id);
  next();
};

module.exports = requestId;
