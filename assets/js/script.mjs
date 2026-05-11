import { renderCv } from "./components/renderers.mjs";

document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("downloadBtn");
    const element = document.querySelector(".cv-shell");
    const languageSelect = document.getElementById("languageSelect");
    const sidebarRoot = document.getElementById("sidebarSectionsRoot");
    const mainRoot = document.getElementById("mainContentRoot");
    const profileRoot = document.getElementById("profileRoot");
    const pageTitleNode = document.getElementById("pageTitle");
    const imageLightbox = document.getElementById("imageLightbox");
    const lightboxDialog = document.getElementById("lightboxDialog");
    const lightboxImage = document.getElementById("lightboxImage");
    const closeLightbox = document.getElementById("closeLightbox");

    let currentLanguage = "en";
    let cvData = null;
    let closeLightboxModal = null;
    const dataBaseUrl = new URL("../../data/", import.meta.url);

    const loadJson = async (path) => {
        const response = await fetch(new URL(path, dataBaseUrl));

        if (!response.ok) {
            throw new Error(`Failed to load ${path}: ${response.status}`);
        }

        return response.json();
    };

    const buildCvData = async () => {
        const [
            common,
            sidebarEn,
            sidebarVi,
            summaryEn,
            summaryVi,
            hopeeEn,
            hopeeVi,
            shbEn,
            shbVi,
            projectsEn,
            projectsVi
        ] = await Promise.all([
            loadJson("common.json"),
            loadJson("sidebar/sidebar.en.json"),
            loadJson("sidebar/sidebar.vi.json"),
            loadJson("summary/summary.en.json"),
            loadJson("summary/summary.vi.json"),
            loadJson("experience/hopee.en.json"),
            loadJson("experience/hopee.vi.json"),
            loadJson("experience/shb.en.json"),
            loadJson("experience/shb.vi.json"),
            loadJson("projects/projects.en.json"),
            loadJson("projects/projects.vi.json")
        ]);

        return {
            workStart: common.workStart,
            ui: common.ui,
            profile: common.profile,
            contact: common.contact,
            sidebarSections: {
                en: sidebarEn,
                vi: sidebarVi
            },
            mainSections: {
                en: [
                    summaryEn,
                    {
                        type: "experience",
                        eyebrow: "Experience",
                        title: "Work Experience",
                        companies: [hopeeEn, shbEn]
                    },
                    projectsEn
                ],
                vi: [
                    summaryVi,
                    {
                        type: "experience",
                        eyebrow: "Kinh nghiệm",
                        title: "Quá trình làm việc",
                        companies: [hopeeVi, shbVi]
                    },
                    projectsVi
                ]
            }
        };
    };

    const getExperienceYearsLabel = (language) => {
        const start = cvData.workStart;
        const startDate = new Date(start.year, start.monthIndex, start.day);
        const now = new Date();
        let years = now.getFullYear() - startDate.getFullYear();
        const hasPassedWorkAnniversary =
            now.getMonth() > startDate.getMonth() ||
            (now.getMonth() === startDate.getMonth() && now.getDate() >= startDate.getDate());

        if (!hasPassedWorkAnniversary) {
            years -= 1;
        }

        const safeYears = Math.max(0, years);
        return cvData.ui[language].yearsLabel.replace("{years}", safeYears);
    };

    const bindLightbox = () => {
        if (!imageLightbox || imageLightbox.dataset.bound === "true") {
            return;
        }

        closeLightboxModal = () => {
            imageLightbox.classList.remove("is-open");
            imageLightbox.setAttribute("aria-hidden", "true");
        };

        if (closeLightbox) {
            closeLightbox.addEventListener("click", closeLightboxModal);
        }

        imageLightbox.addEventListener("click", (event) => {
            if (event.target === imageLightbox || event.target.hasAttribute("data-close-lightbox")) {
                closeLightboxModal();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && imageLightbox.classList.contains("is-open")) {
                closeLightboxModal();
            }
        });

        imageLightbox.dataset.bound = "true";
    };

    const syncUiText = () => {
        const ui = cvData.ui[currentLanguage];

        if (languageSelect) {
            languageSelect.setAttribute("aria-label", ui.languageSelectAria);
            languageSelect.innerHTML = `
                <option value="en"${currentLanguage === "en" ? " selected" : ""}>${ui.languageOptions.en}</option>
                <option value="vi"${currentLanguage === "vi" ? " selected" : ""}>${ui.languageOptions.vi}</option>
            `;
        }

        if (button) {
            button.setAttribute("aria-label", ui.exportButtonAria);
            const icon = button.querySelector("img");
            if (icon) {
                icon.alt = ui.exportImageAlt;
            }
        }

        if (lightboxDialog) {
            lightboxDialog.setAttribute("aria-label", ui.lightboxDialogAria);
        }

        if (closeLightbox) {
            closeLightbox.setAttribute("aria-label", ui.lightboxCloseAria);
        }

        if (lightboxImage) {
            lightboxImage.alt = ui.avatarImageAlt;
        }
    };

    const bindAvatarPreview = () => {
        const avatarPreview = document.getElementById("avatarPreview");

        if (!avatarPreview || !imageLightbox || avatarPreview.dataset.bound === "true") {
            return;
        }

        const openLightbox = () => {
            imageLightbox.classList.add("is-open");
            imageLightbox.setAttribute("aria-hidden", "false");
        };

        avatarPreview.addEventListener("click", openLightbox);
        avatarPreview.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openLightbox();
            }
        });

        avatarPreview.dataset.bound = "true";
    };

    const render = () => {
        if (!cvData) {
            return;
        }

        const yearsLabel = getExperienceYearsLabel(currentLanguage);
        syncUiText();
        renderCv({
            language: currentLanguage,
            yearsLabel,
            data: cvData,
            sidebarRoot,
            mainRoot,
            profileRoot,
            pageTitleNode,
            pageLangNode: document.documentElement
        });
        bindAvatarPreview();
    };

    bindLightbox();

    if (languageSelect) {
        languageSelect.addEventListener("change", (event) => {
            currentLanguage = event.target.value === "vi" ? "vi" : "en";
            render();
        });
    }

    if (!button || !element) {
        return;
    }

    button.addEventListener("click", async () => {
        const ui = cvData.ui[currentLanguage];

        const defaultLabel = button.innerHTML;
        button.disabled = true;
        button.innerHTML = ui.exportLoading;
        let cleanedUp = false;

        const cleanup = () => {
            if (cleanedUp) {
                return;
            }

            cleanedUp = true;
            document.body.classList.remove("pdf-export");
            button.disabled = false;
            button.innerHTML = defaultLabel;
            window.removeEventListener("afterprint", cleanup);
        };

        try {
            window.addEventListener("afterprint", cleanup);
            document.body.classList.add("pdf-export");
            await new Promise((resolve) => setTimeout(resolve, 60));
            window.print();
            cleanup();
        } catch (error) {
            console.error("Print dialog failed:", error);
            alert(ui.exportPrintError);
            cleanup();
        } finally {
            setTimeout(cleanup, 200);
        }
    });

    buildCvData()
        .then((data) => {
            cvData = data;
            render();
        })
        .catch((error) => {
            console.error("Cannot load CV data:", error);
            alert("Cannot load CV data. Please run this site through a local server or deploy it on hosting.");
        });
});
