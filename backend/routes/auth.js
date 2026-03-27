const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users } = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "azf&àéf&)f&8éf&";

router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (users.find(u => u.email === email)) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        const hashedPasword = await bcrypt.hash(password, 10);

        const newUser = {
            id: users.length + 1,
            email,
            password: hashedPasword,
            name,
            role: 'Voyageur'
        };
        
        users.push(newUser);

        const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role },
            JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, user: { id: newUser.id, email, name, role: newUser.role } });
    } catch (error) {
        res.status(500).json({ 'error': 'Erreur lors de l\'authentification' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({ 'error': 'Utilisateur non trouvé' });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({'error': 'Mot de passe incorrect'});
        }

        const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role}} );

    } catch (error) {
        return res.status(500).json({'error': 'Erreurs lors de la connexion'});
    }
})

// Middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({'error': 'Token manquant'});
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 'error': 'Token invalide ou expiré' });
    }
}

router.get('/me', verifyToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

module.exports = { router, verifyToken };