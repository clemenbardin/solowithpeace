const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');
const FeatureFlag = require('../models/FeatureFlag');
const { authSuccessTotal } = require('../metrics');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'swp_jwt_secret_change_in_prod';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, mot de passe et nom requis' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const initials = name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const newUser = await User.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim(),
      role: 'Voyageur',
      avatar_initials: initials,
    });

    const token = jwt.sign({ id: newUser._id.toString(), email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role, avatar_initials: newUser.avatar_initials } });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ error: "Erreur lors de l'inscription" });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le maintenance_mode pour les utilisateurs non-admin
    if (user.role !== 'Admin') {
      const maintenanceFlag = await FeatureFlag.findOne({ key: 'maintenance_mode' });
      if (maintenanceFlag && maintenanceFlag.enabled) {
        return res.status(503).json({ error: 'Le site est actuellement en maintenance. Veuillez réessayer plus tard.' });
      }
    }

    authSuccessTotal.inc();

    if (user.mfa_enabled) {
      const tempToken = jwt.sign(
        { id: user._id.toString(), mfa_pending: true },
        JWT_SECRET,
        { expiresIn: '5m' }
      );
      return res.json({ mfaRequired: true, tempToken });
    }

    const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role, avatar_initials: user.avatar_initials } });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Déconnexion réussie' });
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {return res.status(404).json({ error: 'Utilisateur non trouvé' });}
    res.json(user);
  } catch (err) {
    console.error('[me]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// MFA
router.post('/mfa/setup', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {return res.status(404).json({ error: 'Utilisateur non trouvé' });}
    if (user.mfa_enabled) {
      return res.status(400).json({ error: 'MFA déjà activé' });
    }

    const secret = speakeasy.generateSecret({
      name: `SoloWithPeace (${user.email})`,
      length: 20,
    });

    // Stocke le secret temporairement (pas encore activé)
    await User.findByIdAndUpdate(user._id, { mfa_secret: secret.base32 });

    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
      qrCode,                    // image base64 à afficher dans le frontend
      secret: secret.base32,     // texte alternatif pour saisie manuelle
    });
  } catch (err) {
    console.error('[mfa/setup]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/mfa/verify-setup', verifyToken, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {return res.status(400).json({ error: 'Code requis' });}

    const user = await User.findById(req.user.id);
    if (!user || !user.mfa_secret) {
      return res.status(400).json({ error: 'Lance /mfa/setup avant de vérifier' });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token: code,
      window: 1,   // tolère ±30s de décalage horloge
    });

    if (!isValid) {return res.status(400).json({ error: 'Code invalide' });}

    await User.findByIdAndUpdate(user._id, { mfa_enabled: true });
    res.json({ success: true, message: 'MFA activé avec succès' });
  } catch (err) {
    console.error('[mfa/verify-setup]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/mfa/verify', verifyToken, async (req, res) => {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) {
      return res.status(400).json({ error: 'tempToken et code requis' });
    }

    let payload;
    try {
      payload = jwt.verify(tempToken, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Session expirée, reconnectez-vous' });
    }

    if (!payload.mfa_pending) {
      return res.status(400).json({ error: 'Token invalide' });
    }

    const user = await User.findById(payload.id);
    if (!user || !user.mfa_enabled || !user.mfa_secret) {
      return res.status(400).json({ error: 'MFA non configuré' });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!isValid) {return res.status(401).json({ error: 'Code invalide ou expiré' });}

    // Code OK → JWT définitif
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role, avatar_initials: user.avatar_initials } });
  } catch (err) {
    console.error('[mfa/verify]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/mfa/disable', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {return res.status(404).json({ error: 'Utilisateur non trouvé' });}

    if (!user.mfa_enabled) {
      return res.status(400).json({ error: 'MFA déjà désactivé' });
    }

    await User.findByIdAndUpdate(user._id, {
      mfa_enabled: false,
      mfa_secret: null,
    });

    res.json({ success: true, message: 'MFA désactivé' });
  } catch (err) {
    console.error('[mfa/disable]', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Accès administrateur requis' });
    }
    next();
  });
};

module.exports = { router, verifyToken, verifyAdmin };