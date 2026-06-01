/* ============================================
   CAMPUS CONNECT — MAIN JS
   ============================================ */

// ── NAVBAR SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 20);
});

// ── HAMBURGER ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger?.addEventListener('click', () => {
  mobileMenu?.classList.toggle('open');
});

// ── COUNTER ANIMATION ──
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target);
    const duration = 1600;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    };
    tick();
  });
}
// Trigger on scroll into view
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { animateCounters(); obs.disconnect(); }
  }, { threshold: 0.5 });
  obs.observe(heroStats);
}

// ── FEATURE CARDS SCROLL REVEAL ──
const featureCards = document.querySelectorAll('.feature-card');
if (featureCards.length) {
  const cardObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.style.animation = `fadeUp 0.5s ease both`;
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
        }, parseInt(delay));
        cardObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  featureCards.forEach(c => cardObs.observe(c));
}

// ── SAMPLE POSTS DATA ──
const samplePosts = [
  {
    id: 1, type: 'update', author: 'Rahul Sharma', avatar: '👨‍💻',
    time: '2 min ago',
    content: '📌 No class for CSE301 (Data Structures) today. Prof Kumar is unwell. Make-up class will be announced on Teams.',
  },
  {
    id: 2, type: 'event', author: 'Student Council', avatar: '🎓',
    time: '18 min ago',
    content: '🎉 HackVITAP 2025 is officially open for registrations! 48-hour hackathon on Nov 15–16. Prizes worth ₹1,00,000. Register at hackvitap.in before Nov 10.',
  },
  {
    id: 3, type: 'lost', author: 'Priya Nair', avatar: '👩‍🎓',
    time: '34 min ago',
    content: '🔍 Lost my AirPods Pro (white case, name sticker on back) somewhere near the B-Block cafeteria around 1 PM. If found please WhatsApp: 9876543210. Will reward!',
  },
  {
    id: 4, type: 'issue', author: 'Hostel Block A', avatar: '🏠',
    time: '1 hr ago',
    content: '⚠️ WiFi is completely down in Hostel A, floors 2–4 since 10 PM. Already raised a ticket (#2847) with IT helpdesk. Please upvote so it gets priority attention.',
  },
  {
    id: 5, type: 'update', author: 'Exam Cell', avatar: '📋',
    time: '2 hr ago',
    content: 'Mid-semester examination schedule for Nov 12–22 has been released. Check the portal under Academic Calendar. Internal marks entry deadline: Nov 8.',
  },
  {
    id: 6, type: 'lost', author: 'Ankit Verma', avatar: '👨‍🏫',
    time: '3 hr ago',
    content: '🔍 Found: Blue Hydro Flask water bottle near Library Block entrance. Currently with me in Room 412, Tower 2 hostel. DM to claim — please describe the bottle.',
  },
  {
    id: 7, type: 'issue', author: 'ECE Lab Users', avatar: '⚡',
    time: '5 hr ago',
    content: '⚠️ AC not working in ECE Lab 3 for the past 3 days. Temperature is unbearable during afternoon sessions. Requesting urgent maintenance from facilities team.',
  },
  {
    id: 8, type: 'event', author: 'Cultural Committee', avatar: '🎭',
    time: '6 hr ago',
    content: '🎭 Auditions for Gravitas 2025 Cultural Night are OPEN! Looking for singers, dancers, stand-up comedians, and bands. Audition venue: Auditorium Hall B, Nov 9 at 5 PM.',
  },
];

let currentFilter = 'all';
let visibleCount = 6;
let posts = [...samplePosts];
let userPosts = JSON.parse(localStorage.getItem('campus_posts') || '[]');
const allPosts = [...userPosts, ...posts];

function getTagLabel(type) {
  const map = { update: 'Update', lost: 'Lost & Found', issue: 'Issue', event: 'Event' };
  return map[type] || type;
}

function createPostCard(post, index) {
  const card = document.createElement('div');
  card.className = 'post-card';
  card.dataset.type = post.type;
  card.style.animationDelay = `${index * 0.07}s`;
  card.innerHTML = `
    <div class="post-card-header">
      <div class="post-author">
        <div class="post-avatar">${post.avatar}</div>
        <div>
          <div class="post-name">${post.author}</div>
          <div class="post-time">${post.time}</div>
        </div>
      </div>
      <span class="post-tag ${post.type}">${getTagLabel(post.type)}</span>
    </div>
    <p class="post-content">${post.content}</p>
    <div class="post-actions">
      <button class="post-action-btn" onclick="toggleLike(this)">
        👍 <span class="like-count">${Math.floor(Math.random()*40)+2}</span>
      </button>
      <button class="post-action-btn" onclick="handleComment()">
        💬 Comment
      </button>
      <button class="post-action-btn" onclick="handleShare()">
        🔗 Share
      </button>
    </div>
  `;
  return card;
}

function renderFeed() {
  const grid = document.getElementById('feedGrid');
  if (!grid) return;

  const filtered = allPosts.filter(p => currentFilter === 'all' || p.type === currentFilter);
  const visible = filtered.slice(0, visibleCount);

  grid.innerHTML = '';
  if (visible.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🗂️</div>
        <h3>No posts yet</h3>
        <p>Be the first to post in this category.</p>
      </div>`;
    return;
  }
  visible.forEach((post, i) => grid.appendChild(createPostCard(post, i)));

  const loadBtn = document.getElementById('loadMoreBtn');
  if (loadBtn) {
    loadBtn.style.display = filtered.length > visibleCount ? 'inline-block' : 'none';
  }
}

// ── FILTERS ──
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    visibleCount = 6;
    renderFeed();
  });
});

// ── LOAD MORE ──
document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
  visibleCount += 4;
  renderFeed();
});

// ── POST MODAL ──
let selectedType = 'update';

function openPostModal() {
  document.getElementById('postModal')?.classList.add('open');
  document.getElementById('postContent')?.focus();
}
function closePostModal() {
  document.getElementById('postModal')?.classList.remove('open');
  document.getElementById('postContent').value = '';
  document.getElementById('charCount').textContent = '0';
}
window.openPostModal = openPostModal;
window.closePostModal = closePostModal;

// Type buttons
document.querySelectorAll('.type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedType = btn.dataset.type;
  });
});

// Char counter
document.getElementById('postContent')?.addEventListener('input', function () {
  const count = this.value.length;
  const el = document.getElementById('charCount');
  if (el) {
    el.textContent = count;
    el.style.color = count > 260 ? 'var(--red)' : 'var(--text-3)';
  }
});

// Close modal on backdrop
document.getElementById('postModal')?.addEventListener('click', function (e) {
  if (e.target === this) closePostModal();
});

function submitPost() {
  const content = document.getElementById('postContent')?.value.trim();
  if (!content) { showToast('⚠️ Please write something first.', 'error'); return; }
  if (content.length > 280) { showToast('⚠️ Post too long (max 280 chars).', 'error'); return; }

  const newPost = {
    id: Date.now(),
    type: selectedType,
    author: 'You',
    avatar: '😊',
    time: 'Just now',
    content,
  };

  allPosts.unshift(newPost);
  userPosts.unshift(newPost);
  localStorage.setItem('campus_posts', JSON.stringify(userPosts));
  closePostModal();
  renderFeed();
  showToast('✅ Post published to campus feed!');
}
window.submitPost = submitPost;

// ── LIKE TOGGLE ──
function toggleLike(btn) {
  btn.classList.toggle('liked');
  const countEl = btn.querySelector('.like-count');
  if (countEl) {
    let c = parseInt(countEl.textContent);
    countEl.textContent = btn.classList.contains('liked') ? c + 1 : c - 1;
  }
}
window.toggleLike = toggleLike;

function handleComment() { showToast('💬 Comments coming in v2!'); }
function handleShare() {
  navigator.clipboard?.writeText(window.location.href).then(() => showToast('🔗 Link copied!'));
}
window.handleComment = handleComment;
window.handleShare = handleShare;

// ── TOAST ──
let toastTimer;
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.borderColor = type === 'error' ? 'var(--red)' : 'var(--green)';
  toast.style.color = type === 'error' ? 'var(--red)' : 'var(--green)';
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}
window.showToast = showToast;

// ── INIT ──
renderFeed();