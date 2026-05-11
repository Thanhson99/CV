function escapeHtml(value = "") {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function fillYears(text, yearsLabel) {
    return text.replaceAll("{years}", yearsLabel);
}

function renderContactList(items) {
    return `
        <ul class="icon-list">
            ${items.map((item) => `
                <li>
                    <i class="${escapeHtml(item.icon)}"></i>
                    <a href="${escapeHtml(item.href)}"${item.href.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(item.label)}</a>
                </li>
            `).join("")}
        </ul>
    `;
}

function renderSidebarSection(section, contactItems) {
    if (section.type === "contact") {
        return `
            <section class="side-section side-section-contact">
                <h2>${escapeHtml(section.title)}</h2>
                ${renderContactList(contactItems)}
            </section>
        `;
    }

    if (section.type === "skills") {
        return `
            <section class="side-section side-section-skills">
                <h2>${escapeHtml(section.title)}</h2>
                ${section.items.map((item) => `
                    <div class="skill-block">
                        <h3>${escapeHtml(item.title)}</h3>
                        <p>${escapeHtml(item.text)}</p>
                    </div>
                `).join("")}
            </section>
        `;
    }

    return `
        <section class="side-section side-section-text">
            <h2>${escapeHtml(section.title)}</h2>
            ${section.titleLine ? `<p class="side-title">${escapeHtml(section.titleLine)}</p>` : ""}
            ${(section.lines || []).map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
        </section>
    `;
}

function renderMetaLine(meta) {
    if (meta.href) {
        return `<p class="meta-line"><strong>${escapeHtml(meta.label)}:</strong> <a href="${escapeHtml(meta.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(meta.value)}</a></p>`;
    }

    return `<p class="meta-line"><strong>${escapeHtml(meta.label)}:</strong> ${escapeHtml(meta.value)}</p>`;
}

function renderProjectCard(project) {
    return `
        <div class="project-card">
            <div class="project-head">
                <h4>${escapeHtml(project.name)}</h4>
                <div class="project-tags">
                    ${(project.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
                </div>
            </div>
            ${project.bullets ? `
                <ul>
                    ${project.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}
                </ul>
            ` : ""}
            ${(project.meta || []).map(renderMetaLine).join("")}
        </div>
    `;
}

function renderCompanyCard(company) {
    const cardClass = company.compact ? "company-card compact-company" : "company-card";
    return `
        <article class="${cardClass}">
            <div class="company-head">
                <div>
                    <h3>${escapeHtml(company.role)}</h3>
                    <p class="company-name">${escapeHtml(company.company)}</p>
                </div>
                ${company.period || company.level ? `
                    <div class="company-meta">
                        ${company.period ? `<span>${escapeHtml(company.period)}</span>` : ""}
                        ${company.level ? `<span>${escapeHtml(company.level)}</span>` : ""}
                    </div>
                ` : ""}
            </div>
            ${company.summary ? `<p class="company-summary">${escapeHtml(company.summary)}</p>` : ""}
            ${company.projects ? company.projects.map(renderProjectCard).join("") : ""}
            ${company.repos ? `
                <ul class="repo-list">
                    ${company.repos.map((repo) => `
                        <li>
                            <strong>${escapeHtml(repo.name)}</strong> - ${escapeHtml(repo.desc)}
                            ${repo.links.map((link, index) => `${index === 0 ? "" : " | "}<a href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`).join("")}
                        </li>
                    `).join("")}
                </ul>
            ` : ""}
        </article>
    `;
}

function renderHeroSection(section, yearsLabel) {
    return `
        <section class="hero-card">
            <div>
                <p class="eyebrow">${escapeHtml(section.eyebrow)}</p>
                <h2>${escapeHtml(section.title)}</h2>
            </div>
            <p>${escapeHtml(fillYears(section.summary, yearsLabel))}</p>
            <div class="hero-stats">
                ${section.stats.map((stat) => `
                    <div class="stat-card">
                        <strong>${escapeHtml(fillYears(stat.strong, yearsLabel))}</strong>
                        <span>${escapeHtml(stat.label)}</span>
                    </div>
                `).join("")}
            </div>
        </section>
    `;
}

function renderContentBlock(section) {
    if (section.type === "hero") {
        return "";
    }

    const cards = section.companies || section.cards || [];
    return `
        <section class="content-section">
            <div class="section-header">
                <p class="eyebrow">${escapeHtml(section.eyebrow)}</p>
                <h2>${escapeHtml(section.title)}</h2>
            </div>
            ${cards.map(renderCompanyCard).join("")}
        </section>
    `;
}

export function renderCv({ language, yearsLabel, data, sidebarRoot, mainRoot, profileRoot, pageTitleNode, pageLangNode }) {
    const sidebarSections = data.sidebarSections[language];
    const mainSections = data.mainSections[language];
    const heroSection = mainSections.find((section) => section.type === "hero");
    const contentSections = mainSections.filter((section) => section.type !== "hero");
    const profile = data.profile;
    const ui = data.ui[language];

    profileRoot.innerHTML = `
        <img src="${escapeHtml(profile.avatar)}" alt="${escapeHtml(ui.avatarImageAlt)}" class="avatar" id="avatarPreview" role="button" tabindex="0" aria-label="${escapeHtml(ui.avatarOpenAria)}">
        <h1>${escapeHtml(profile.name[language])}</h1>
        <div class="location">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg" alt="${escapeHtml(ui.flagAlt)}" class="flag-icon">
            <span>${escapeHtml(profile.locationLabel[language])}</span>
        </div>
        <p class="role">${escapeHtml(profile.role[language])}</p>
        <p class="headline">${escapeHtml(fillYears(profile.headline[language], yearsLabel))}</p>
    `;

    sidebarRoot.innerHTML = sidebarSections.map((section) => renderSidebarSection(section, data.contact)).join("");
    mainRoot.innerHTML = `${renderHeroSection(heroSection, yearsLabel)}${contentSections.map(renderContentBlock).join("")}`;
    pageTitleNode.textContent = ui.pageTitle;
    pageLangNode.lang = language;
}
