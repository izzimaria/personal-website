(function () {
  const containers = document.querySelectorAll('.substack-feed-embed, #substack-feed-embed');
  if (!containers.length) return;

  const truncate = (str, max = 160) =>
    str && str.length > max ? `${str.slice(0, max)}…` : str || '';

  const buildCard = (post) => {
    const a = document.createElement('a');
    a.className = 'substack-card';
    a.target = '_blank';
    a.rel = 'noopener';
    a.href = post.link || '#';

    const wrap = document.createElement('div');
    wrap.className = 'substack-post';

    const body = document.createElement('div');

    const h3 = document.createElement('h3');
    h3.className = 'substack-title';
    h3.textContent = post.title || 'Untitled';
    body.appendChild(h3);

    if (post.date) {
      const pDate = document.createElement('p');
      pDate.className = 'substack-date';
      pDate.textContent = post.date;
      body.appendChild(pDate);
    }

    if (post.desc) {
      const pDesc = document.createElement('p');
      pDesc.className = 'substack-desc';
      pDesc.textContent = truncate(post.desc);
      body.appendChild(pDesc);
    }

    wrap.appendChild(body);
    a.appendChild(wrap);
    return a;
  };

  containers.forEach(async (container) => {
    container.innerHTML = '<div class="substack-skeleton">Loading…</div>';

    try {
      const res = await fetch('./posts.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const posts = await res.json();

      if (!posts.length) {
        container.innerHTML = '<p class="substack-empty">No posts yet.</p>';
        return;
      }

      container.innerHTML = '';
      posts.forEach((post) => container.appendChild(buildCard(post)));
    } catch (err) {
      console.error('Error loading posts:', err);
      container.innerHTML =
        '<p class="substack-error">Could not load posts. <a href="https://izzimaria.substack.com/">Read on Substack →</a></p>';
    }
  });
})();
