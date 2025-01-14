// script.js
async function handleLogin(event) {
    event.preventDefault();

  
    const username = document.getElementById('user_name').value;
    const password = document.getElementById('password').value;
  
    try {
        console.log(username,password)
      const response = await fetch('http://localhost:5001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: username, password }),
      });
  
      const data = await response.json();
      console.log(200)
  
      if (response.status === 200) {
        alert(data.message);
        window.location.href = 'index2.html'; // Redirection en cas de succès
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      alert('Une erreur s’est produite. Veuillez réessayer.');
    }
  }
  
  async function handleRegister(event) {
    event.preventDefault();
  
    const username = document.getElementById('user_name').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('http://localhost:5001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: username, password }),
      });
  
      const data = await response.json();
  
      if (response.status === 201) {
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Erreur lors de l’inscription :', error);
      alert('Une erreur s’est produite. Veuillez réessayer.');
    }
  }
  