// script2.js

// Fonction de recherche des étudiants
async function searchStudents() {
    const query = document.getElementById('search-query').value;
    console.log(query);
    const response = await fetch(`http://localhost:5001/search?query=${query}`);
    const students = await response.json();
  
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Vider les résultats précédents
  
    if (students.length === 0) {
      resultsContainer.innerHTML = '<li>Aucun étudiant trouvé.</li>';
      return;
    }
    console.log(students)
  
    students.forEach(student => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${student.nom}</strong> - ${student.poste} à ${student.entreprise}
        <button onclick="viewDetails(${student.id_ancien_etudiant})">Voir détails</button>
      `;
      resultsContainer.appendChild(li);
    });
  }
  
  // Afficher les détails de l'étudiant
  function viewDetails(id) {
    window.location.href = `details.html?id=${id}`;
  }
  
  // Fonction pour récupérer et afficher la liste des étudiants
async function fetchStudents() {
    try {
      const response = await fetch('http://localhost:5001/students'); // Récupère la liste des étudiants
      const students = await response.json(); // Récupère les données sous forme de JSON
  
      const studentList = document.getElementById('student-list');
      studentList.innerHTML = ''; // Vide la liste avant d'afficher les nouveaux résultats
  
      if (students.length === 0) {
        studentList.innerHTML = '<li>Aucun étudiant trouvé.</li>';
        return;
      }
  
      // Parcours de la liste des étudiants et ajout à la page
      students.forEach(student => {
        const listItem = document.createElement('li');
        const studentLink = document.createElement('a');
        studentLink.href = `details.html?id=${student.id_ancien_etudiant}`; // Lien vers les détails
        studentLink.textContent = student.nom;
        listItem.appendChild(studentLink);
        studentList.appendChild(listItem);
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des étudiants:', error);
    }
  }

  // Rediriger vers la page de détails d'une catégorie
  async function fetchStudentsByFiliere(category) {

    try {
      // Requête vers le backend pour récupérer les étudiants
      const response = await fetch(`http://localhost:5001/category/${encodeURIComponent(category)}`);
      console.log(response);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des étudiants');
      }
  
      const students = await response.json();
  
      // Stocker les données dans le Local Storage pour les transmettre à une autre page
      localStorage.setItem('studentsData', JSON.stringify(students));
  
      // Rediriger vers une nouvelle page (par exemple : `details.html`)
      window.location.href = `details.html?filiere=${encodeURIComponent(category)}`;
    } catch (error) {
      console.error(error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    }
  }
  
 
  