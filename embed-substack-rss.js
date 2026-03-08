(function () {
  const containers = document.querySelectorAll('.substack-feed-embed, #substack-feed-embed');
  if (!containers.length) return;

  const fmtDate = (iso) => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short'
      }).format(new Date(iso));
    } catch {
      return '';
    }
  };

  const normalizeUrl = (u) => {
    if (!u) return '';
    return /^https?:\/\//i.test(u) ? u.replace(/\/$/, '') : `https://${u.replace(/\/$/, '')}`;
  };

  const truncate = (str, max = 160) =>
    str && str.length > max ? `${str.slice(0, max)}…` : str || '';

  const buildCard = (post) => {
    const a = document.createElement('a');
    a.className = 'substack-card';
    a.target = '_blank';
    a.rel = 'noopener';
    a.href = post.canonical_url || post.url || '#';

    const wrap = document.createElement('div');
    wrap.className = 'substack-post';

    const body = document.createElement('div');

    const h3 = document.createElement('h3');
    h3.className = 'substack-title';
    h3.textContent = post.title || 'Untitled';
    body.appendChild(h3);

    if (post.post_date) {
      const pDate = document.createElement('p');
      pDate.className = 'substack-date';
      pDate.textContent = fmtDate(post.post_date);
      body.appendChild(pDate);
    }

    const subtitle = post.subtitle || post.description || '';
    if (subtitle) {
      const pDesc = document.createElement('p');
      pDesc.className = 'substack-desc';
      pDesc.textContent = truncate(subtitle, 160);
      body.appendChild(pDesc);
    }

    wrap.appendChild(body);
    a.appendChild(wrap);
    return a;
  };

  containers.forEach(async (container) => {
    const rawUrl = container.getAttribute('data-substack-url') || '';
    const limit = parseInt(container.getAttribute('data-posts'), 10) || 10;

    if (!rawUrl) {
      container.innerHTML = '<p class="substack-error">Error: No Substack URL specified.</p>';
      return;
    }

    const base = normalizeUrl(rawUrl);
    const apiUrl = `${base}/api/v1/posts?limit=${limit}`;

    container.innerHTML = '<div class="substack-skeleton">Loading…</div>';

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const posts = await res.json();

      // Filter out "coming soon" placeholder posts
      const filtered = posts.filter(p =>
        p.title && p.title.toLowerCase() !== 'coming soon' && p.audience !== 'only_paid'
      );

      if (!filtered.length) {
        container.innerHTML = '<p class="substack-empty">No posts available yet.</p>';
        return;
      }

      container.innerHTML = '';
      filtered.forEach((post) => {
        container.appendChild(buildCard(post));
      });
    } catch (err) {
      console.error('Substack feed error:', err);
      container.innerHTML =
        '<p class="substack-error">Could not load posts. <a href="' + base + '">Read on Substack →</a></p>';
    }
  });
})();
