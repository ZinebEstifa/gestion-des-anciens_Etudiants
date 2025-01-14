// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db'); // Assurez-vous que ce fichier contient la configuration de la base de données

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Endpoint pour valider les identifiants (Connexion)
app.post('/login', (req, res) => {
  const { user_name, password } = req.body;
  console.log("une connexion a ete etablie", user_name,password)

  const sql = 'SELECT * FROM gestion_anciensetudiants.utilisateur WHERE user_name = ? AND password = ?';
  
  db.query(sql, [user_name, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      res.status(200).json({ message: 'Connexion réussie' });
    } else {
      res.status(401).json({ message: "Nom d’utilisateur ou mot de passe incorrect." });
    }
  });
});

// Endpoint pour inscrire un nouvel utilisateur
app.post('/register', (req, res) => {
  const { user_name, password } = req.body;

  const checkUserSql = 'SELECT * FROM gestion_anciensetudiants.utilisateur WHERE user_name = ?';
  db.query(checkUserSql, [user_name], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      res.status(409).json({ message: 'Le nom d’utilisateur existe déjà.' });
    } else {
      const insertUserSql = 'INSERT INTO gestion_anciensetudiants.utilisateur (user_name, password) VALUES (?, ?)';
      db.query(insertUserSql, [user_name, password], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Inscription réussie. Vous pouvez maintenant vous connecter.' });
      });
    }
  });
});


// Route pour rechercher des étudiants
app.get('/search', (req, res) => {
  const query = req.query.query;
  console.log(query)
  if (!query) {
    return res.status(400).json({ message: 'Aucun critère de recherche spécifié' });
  }

  const sql = `
    SELECT ae.*, pp.poste, pp.entreprise, c.email, c.numero_telephone
    FROM gestion_anciensetudiants.ancien_etudiant ae
    JOIN gestion_anciensetudiants.parcours_professionel pp ON ae.id_parcours_professionel = pp.id_parcours_professionel
    JOIN gestion_anciensetudiants.contact c ON ae.id_contact = c.id_contact
    WHERE ae.nom LIKE ? OR pp.poste LIKE ? OR pp.entreprise LIKE ?
  `;
  db.query(sql, [`%${query}%`, `%${query}%`, `%${query}%`], (err, results) => {
    console.log(results,err)
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Aucun étudiant trouvé' });
    }
    res.json(results);
  });
});


// Route pour récupérer les détails d'un étudiant par ID
app.get('/student/:id', (req, res) => {
    const studentId = req.params.id;
    console.log("ID de l'étudiant:", studentId);

    // Requête SQL pour récupérer les informations de l'étudiant et son parcours professionnel
    const query = `
     SELECT ae.*, pp.poste, pp.entreprise, c.email, c.numero_telephone
    FROM gestion_anciensetudiants.ancien_etudiant ae
    JOIN gestion_anciensetudiants.parcours_professionel pp ON ae.id_parcours_professionel = pp.id_parcours_professionel
    JOIN gestion_anciensetudiants.contact c ON ae.id_contact = c.id_contact
    WHERE ae.id_ancien_etudiant = ?
    `;
  
    db.query(query, [studentId], (err, results) => {
        console.log(results, err);
        if (err) {
            return res.status(500).json({ message: 'Erreur serveur' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Aucun étudiant trouvé' });
        }
        res.json(results[0]); // Renvoie le premier résultat, l'étudiant recherché
    });
});

  
  

  //récupérer les étudiants par catégorie(filière):

  app.get('/category/:category', (req, res) => {
    const category = req.params.category;
    const sql = 'SELECT * FROM gestion_anciensetudiants.ancien_etudiant WHERE category = ?';
  
    db.query(sql, [category], (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération des données.' });
      } else {
        res.json(results); // Renvoie une liste d'étudiants
      }
    });
  });

  // Route pour ajouter ou modifier un projet d'un étudiant
  
app.put('/student/:id/project', (req, res) => {
    const studentId = req.params.id;
    const { projectId, titre, description } = req.body;
  
    if (projectId) {
      // Mise à jour d'un projet existant
      const query = 'UPDATE gestion_anciensetudiants.ancien_etudiant SET id_projet = ? WHERE id_ancien_etudiant = ?';
      db.query(query, [titre, description, projectId], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Erreur lors de la mise à jour du projet' });
        }
        res.json({ message: 'Projet mis à jour avec succès' });
      });
    } else {
      // Ajout d'un nouveau projet
      const query = 'INSERT INTO gestion_anciensetudiants.projet (titre, description) VALUES (?, ?)';
      db.query(query, [titre, description, studentId], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Erreur lors de l\'ajout du projet' });
        }
        res.json({ message: 'Projet ajouté avec succès' });
      });
    }
  });
  
 // Route pour dissocier un projet d'un étudiant
app.delete('/student/:id/project', (req, res) => {
    const studentId = req.params.id;
  
    // Récupérer l'ID du projet actuel de l'étudiant
    const getProjectQuery = 'SELECT id_projet FROM gestion_anciensetudiants.ancien_etudiant WHERE id_ancien_etudiant = ?';
    db.query(getProjectQuery, [studentId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de la récupération du projet' });
      }
  
      if (results.length === 0 || !results[0].projet_id) {
        return res.status(404).json({ error: 'Aucun projet associé à cet étudiant' });
      }
  
      const projectId = results[0].projet_id;
  
      // Supprimer le projet de la table projets
      const deleteProjectQuery = 'DELETE FROM gestion_anciensetudiants.projet WHERE id_ancien_etudiant = ?';
      db.query(deleteProjectQuery, [projectId], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Erreur lors de la suppression du projet' });
        }
  
        // Mettre à jour l'étudiant pour supprimer l'association
        const updateStudentQuery = 'UPDATE gestion_anciensetudiants.ancien_etudiant SET id_projet = NULL WHERE id_ancien_etudiant = ?';
        db.query(updateStudentQuery, [studentId], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la dissociation du projet' });
          }
          res.json({ message: 'Projet dissocié et supprimé avec succès' });
        });
      });
    });
  });

  // Route pour ajouter une formation à un étudiant
app.post('/student/:id/addFormation', (req, res) => {
    const studentId = req.params.id;
    const { formationName } = req.body;
  
    const query = 'INSERT INTO gestion_anciensetudiants.formation (nom_formation,organisme) VALUES (?, ?)';
    db.query(query, [formationName, studentId], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de l\'ajout de la formation' });
      }
      res.json({ message: 'Formation ajoutée avec succès' });
    });
  });

  // Route pour dissocier une formation d'un étudiant
app.delete('/student/:id/formation', (req, res) => {
    const studentId = req.params.id;
  
    // Récupérer l'ID de la formation actuelle de l'étudiant
    const getFormationQuery = 'SELECT id_formation FROM gestion_anciensetudiants.ancien_etudiant WHERE id_ancien_etudiant = ?';
    db.query(getFormationQuery, [studentId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur lors de la récupération de la formation' });
      }
  
      if (results.length === 0 || !results[0].formation_id) {
        return res.status(404).json({ error: 'Aucune formation associée à cet étudiant' });
      }
  
      const formationId = results[0].formation_id;
  
      // Supprimer la formation de la table formations
      const deleteFormationQuery = 'DELETE FROM gestion_anciensetudiants.formation WHERE id_ancien_etudiant = ?';
      db.query(deleteFormationQuery, [formationId], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Erreur lors de la suppression de la formation' });
        }
  
        // Mettre à jour l'étudiant pour supprimer l'association
        const updateStudentQuery = 'UPDATE gestion_anciensetudiants.ancien_etudiant SET id_formation = NULL WHERE id_ancien_etudiant = ?';
        db.query(updateStudentQuery, [studentId], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors de la dissociation de la formation' });
          }
          res.json({ message: 'Formation dissociée et supprimée avec succès' });
        });
      });
    });
  });
  
  
// Lancer le serveur
const port = 5001;
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});



    
     