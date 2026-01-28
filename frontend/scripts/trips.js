// Проверка авторизации
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

// Загрузка поездок
async function loadTrips() {
  try {
    const response = await fetch('http://localhost:3000/api/trips', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const trips = await response.json();
    const tripsList = document.getElementById('tripsList');
    tripsList.innerHTML = trips.map(trip => `
      <div class="trip-card">
        <h3>${trip.name}</h3>
        <p>${new Date(trip.start_date).toLocaleDateString()} — ${new Date(trip.end_date).toLocaleDateString()}</p>
        <button onclick="viewTrip(${trip.trip_id})">Посмотреть</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Выход из аккаунта
document.getElementById('logoutButton').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

// Загрузка поездок при открытии страницы
loadTrips();
