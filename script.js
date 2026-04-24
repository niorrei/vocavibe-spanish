// --- KONFIGURASI FIREBASE ---
const firebaseConfig = {

  apiKey: "AIzaSyCo5v5fBIFzWb0Qg-CVmuxFoDaHXE1ZndI",

  authDomain: "vocavibe-4fd20.firebaseapp.com",

  databaseURL: "https://vocavibe-4fd20-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId: "vocavibe-4fd20",

  storageBucket: "vocavibe-4fd20.firebasestorage.app",

  messagingSenderId: "579358198211",

  appId: "1:579358198211:web:32182df2b01f39b7741576",

  measurementId: "G-Q16PS5KCZE"

};
// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- STATE DATA ---
let words = JSON.parse(localStorage.getItem('voca_words')) || [];
let points = parseInt(localStorage.getItem('voca_points')) || 0;
let dailyCount = parseInt(localStorage.getItem('voca_daily_count')) || 0;
let currentUser = localStorage.getItem('voca_username') || "Guest";

// --- INITIALIZE ---
document.getElementById('display-username').innerText = currentUser;
updateUI();
listenToLeaderboard();

// --- FUNGSI LOGIN ---
document.getElementById('login-btn').addEventListener('click', () => {
    const name = prompt("Masukkan nama pengguna publik kamu:");
    if (name && name.length >= 3) {
        currentUser = name;
        localStorage.setItem('voca_username', name);
        document.getElementById('display-username').innerText = name;
        saveToFirebase(name, points);
        alert("Login berhasil! Skor kamu sekarang publik.");
    }
});

// --- FUNGSI TAMBAH KATA ---
document.getElementById('add-btn').addEventListener('click', () => {
    const sp = document.getElementById('word-input').value.trim();
    const id = document.getElementById('meaning-input').value.trim();

    if (!sp || !id) return;
    if (dailyCount >= 10) return alert("Limit harian tercapai!");

    words.push({ sp, id });
    points += 1;
    dailyCount += 1;

    saveData();
    document.getElementById('word-input').value = "";
    document.getElementById('meaning-input').value = "";
});

function saveData() {
    localStorage.setItem('voca_words', JSON.stringify(words));
    localStorage.setItem('voca_points', points);
    localStorage.setItem('voca_daily_count', dailyCount);
    
    if (currentUser !== "Guest") {
        saveToFirebase(currentUser, points);
    }
    updateUI();
}

function saveToFirebase(name, pts) {
    db.ref('leaderboard/' + name).set({
        name: name,
        points: pts,
        timestamp: Date.now()
    });
}

function listenToLeaderboard() {
    db.ref('leaderboard').orderByChild('points').limitToLast(5).on('value', (snapshot) => {
        const data = snapshot.val();
        const list = document.getElementById('leaderboard-list');
        list.innerHTML = "";
        
        let players = [];
        for(let id in data) { players.push(data[id]); }
        players.sort((a,b) => b.points - a.points);

        players.forEach((p, i) => {
            const isMe = p.name === currentUser;
            const li = document.createElement('li');
            li.className = isMe ? 'my-rank' : '';
            li.innerHTML = `<span>#${i+1} ${p.name}</span> <span>${p.points} pts</span>`;
            list.appendChild(li);
        });
    });
}

function updateUI() {
    document.getElementById('total-points').innerText = points;
    document.getElementById('daily-limit').innerText = `${dailyCount}/10`;
    document.getElementById('progress-fill').style.width = `${(dailyCount/10)*100}%`;
    
    // Render Flashcard Terakhir
    if (words.length > 0) {
        const last = words[words.length-1];
        document.getElementById('display-sp').innerText = last.sp;
        document.getElementById('display-id').innerText = last.id;
    }

    renderWordList();
}

function renderWordList() {
    const list = document.getElementById('vocab-list');
    list.innerHTML = "";
    words.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = "vocab-item neumorph";
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.marginBottom = "10px";
        div.innerHTML = `
            <span><b>${item.sp}</b> = ${item.id}</span>
            <button onclick="deleteWord(${index})" style="color:red; border:none; background:none; cursor:pointer"><i class="fas fa-trash"></i></button>
        `;
        list.appendChild(div);
    });
}

function deleteWord(index) {
    words.splice(index, 1);
    saveData();
}

// Flashcard Flip
document.getElementById('flashcard').addEventListener('click', function() {
    this.classList.toggle('flipped');
});

// Dark Mode Toggle
document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
});