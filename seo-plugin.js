import { PROFILE, SITE_URL, EDUCATION, EXPERIENCE, PROJECTS, SKILLS, AWARDS, STUDIO_ITEMS } from './src/data/profile.js';

/**
 * Build-time SEO for a WebGL SPA:
 *  - replaces the `__SITE_URL__` token in index.html
 *  - injects a crawlable, visually hidden HTML version of the portfolio (#seo-content)
 *  - injects schema.org JSON-LD (Person, WebSite, ProfilePage, projects)
 *  - emits /llms.txt, /robots.txt and /sitemap.xml
 * Everything comes from src/data/profile.js, so the site and its SEO never drift apart.
 */

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const isRealLink = (url) => !!url;

const awardItems = () => Object.values(AWARDS).flatMap((group) => group.items);
const allSkills = () => [...new Set(Object.values(SKILLS).flat())];

function buildJsonLd() {
    const personId = `${SITE_URL}/#person`;
    const graph = [
        {
            '@type': 'Person',
            '@id': personId,
            name: PROFILE.fullName,
            alternateName: [PROFILE.shortName, PROFILE.displayName],
            url: SITE_URL,
            email: `mailto:${PROFILE.email}`,
            jobTitle: PROFILE.role,
            description: PROFILE.summary,
            knowsAbout: allSkills(),
            alumniOf: EDUCATION.map((e) => ({ '@type': 'EducationalOrganization', name: e.school })),
            memberOf: EXPERIENCE.map((x) => ({ '@type': 'Organization', name: x.org })),
            award: awardItems().map((a) => a.label),
            sameAs: [PROFILE.links.linkedin, PROFILE.links.github].filter(isRealLink),
        },
        {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            url: SITE_URL,
            name: `${PROFILE.fullName} | ${PROFILE.role}`,
            publisher: { '@id': personId },
        },
        {
            '@type': 'ProfilePage',
            '@id': `${SITE_URL}/#profilepage`,
            url: SITE_URL,
            mainEntity: { '@id': personId },
        },
        {
            '@type': 'ItemList',
            '@id': `${SITE_URL}/#projectslist`,
            name: `Projects by ${PROFILE.fullName}`,
            numberOfItems: PROJECTS.length,
            itemListElement: PROJECTS.map((p, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                    '@type': 'CreativeWork',
                    name: p.title,
                    description: p.description,
                    ...(isRealLink(p.url) ? { url: p.url } : {}),
                    keywords: p.tech.join(', '),
                    creator: { '@id': personId },
                },
            })),
        },
    ];
    return { '@context': 'https://schema.org', '@graph': graph };
}

function buildSeoHtml() {
    const li = (inner) => `      <li>${inner}</li>\n`;
    let h = `<div id="seo-content" class="sr-only-seo">\n`;
    h += `  <header>\n    <h1>${esc(PROFILE.fullName)} | ${esc(PROFILE.role)}</h1>\n    <p>${esc(PROFILE.summary)}</p>\n  </header>\n`;
    h += `  <nav aria-label="Main Navigation">\n    <ul>\n`;
    for (const [href, label] of [['/', 'Home'], ['/about', 'About'], ['/gallery', 'Projects'], ['/studio', 'Talks & Events'], ['/contact', 'Contact']]) {
        h += li(`<a href="${href}">${label}</a>`);
    }
    h += `    </ul>\n  </nav>\n  <main>\n`;

    h += `  <section id="experience">\n    <h2>Experience</h2>\n`;
    for (const x of EXPERIENCE) {
        h += `    <article>\n      <h3>${esc(x.role)}, ${esc(x.org)} (${esc(x.period)})</h3>\n      <ul>\n`;
        h += x.points.map((p) => `        <li>${esc(p)}</li>\n`).join('');
        h += `      </ul>\n    </article>\n`;
    }
    h += `  </section>\n`;

    h += `  <section id="projects">\n    <h2>Projects</h2>\n    <ul>\n`;
    for (const p of PROJECTS) {
        h += li(`<h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><p>Tech: ${esc(p.tech.join(', '))}</p>${isRealLink(p.url) ? `<a href="${esc(p.url)}">Visit ${esc(p.title)}</a>` : ''}`);
    }
    h += `    </ul>\n  </section>\n`;

    h += `  <section id="education">\n    <h2>Education</h2>\n    <ul>\n`;
    h += EDUCATION.map((e) => li(`${esc(e.degree)}, ${esc(e.school)} (${esc(e.period)})`)).join('');
    h += `    </ul>\n  </section>\n`;

    h += `  <section id="skills">\n    <h2>Technical Skills</h2>\n    <ul>\n`;
    h += Object.entries(SKILLS).map(([group, items]) => li(`<strong>${esc(group)}:</strong> ${esc(items.join(', '))}`)).join('');
    h += `    </ul>\n  </section>\n`;

    h += `  <section id="awards">\n    <h2>Awards & Achievements</h2>\n    <ul>\n`;
    h += awardItems().map((a) => li(`${esc(a.label)} (${esc(a.date)})`)).join('');
    h += `    </ul>\n  </section>\n`;

    h += `  <section id="studio">\n    <h2>Talks, Events & Updates</h2>\n    <ul>\n`;
    h += STUDIO_ITEMS.map((s) => li(`<h3>${esc(s.title)}</h3><p>${esc(s.description)}</p>`)).join('');
    h += `    </ul>\n  </section>\n`;

    h += `  <section id="contact">\n    <h2>Contact</h2>\n    <p><a href="mailto:${esc(PROFILE.email)}">${esc(PROFILE.email)}</a></p>\n`;
    if (isRealLink(PROFILE.links.linkedin)) h += `    <p><a href="${esc(PROFILE.links.linkedin)}">LinkedIn</a></p>\n`;
    if (isRealLink(PROFILE.links.github)) h += `    <p><a href="${esc(PROFILE.links.github)}">GitHub</a></p>\n`;
    h += `    <p><a href="${esc(PROFILE.links.resume)}">Resume (PDF)</a></p>\n  </section>\n`;
    h += `  </main>\n</div>\n`;
    return h;
}

function buildLlmsTxt() {
    let t = `# ${PROFILE.fullName}\n> ${PROFILE.role}. ${PROFILE.summary}\n\n`;
    t += `Contact: ${PROFILE.email}\nResume: ${SITE_URL}${PROFILE.links.resume}\n\n`;
    t += `## Experience\n` + EXPERIENCE.map((x) => `- ${x.role}, ${x.org} (${x.period}): ${x.points.join(' ')}`).join('\n') + '\n\n';
    t += `## Projects\n` + PROJECTS.map((p) => `- [${p.title}](${isRealLink(p.url) ? p.url : SITE_URL + '/gallery'}): ${p.description} (Tech: ${p.tech.join(', ')})`).join('\n') + '\n\n';
    t += `## Education\n` + EDUCATION.map((e) => `- ${e.degree}, ${e.school} (${e.period})`).join('\n') + '\n\n';
    t += `## Skills\n` + Object.entries(SKILLS).map(([g, items]) => `- ${g}: ${items.join(', ')}`).join('\n') + '\n\n';
    t += `## Awards & Achievements\n` + awardItems().map((a) => `- ${a.label} (${a.date})`).join('\n') + '\n';
    return t;
}

const ROUTES = ['/', '/about', '/gallery', '/studio', '/contact'];

const buildRobotsTxt = () => `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

const buildSitemap = () =>
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
` +
    ROUTES.map((r, i) => `  <url><loc>${SITE_URL}${r === '/' ? '/' : r}</loc><priority>${i === 0 ? '1.0' : '0.8'}</priority></url>
`).join('') +
    `</urlset>
`;

export function generateSeoHtml() {
    return {
        name: 'profile-seo-plugin',

        configureServer(server) {
            const files = { '/llms.txt': buildLlmsTxt, '/robots.txt': buildRobotsTxt, '/sitemap.xml': buildSitemap };
            server.middlewares.use((req, res, next) => {
                const build = files[req.url];
                if (!build) return next();
                res.setHeader('Content-Type', req.url.endsWith('.xml') ? 'application/xml' : 'text/plain; charset=utf-8');
                res.end(build());
            });
        },

        transformIndexHtml(html) {
            const jsonLd = `  <script type="application/ld+json">\n${JSON.stringify(buildJsonLd(), null, 2)}\n  </script>\n`;
            return html
                .replaceAll('__SITE_URL__', SITE_URL)
                .replace('</head>', `${jsonLd}</head>`)
                .replace(/<div id="seo-content" class="sr-only-seo">[\s\S]*?<!-- \/seo-content -->/, buildSeoHtml());
        },

        generateBundle() {
            this.emitFile({ type: 'asset', fileName: 'llms.txt', source: buildLlmsTxt() });
            this.emitFile({ type: 'asset', fileName: 'robots.txt', source: buildRobotsTxt() });
            this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemap() });
        },
    };
}
