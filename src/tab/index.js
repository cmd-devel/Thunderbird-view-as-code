(() => {
   'use strict';

    const DEFAULT_LANGUAGE = 'c';
    const DEFAULT_THEME = 'github';

    const THEMES = [
        "androidstudio",
        "dark",
        "default",
        "github",
        "github-dark",
        "googlecode",
        "idea",
        "intellij-light",
        "monokai",
        "monokai-sublime",
        "nord",
        "obsidian",
        "stackoverflow-dark",
        "stackoverflow-light",
        "xcode",
    ];

    const getBgThemeName = (theme) => {
        return 'theme-' + theme;
    }

    const getCssThemeName = (theme) => {
        return 'vendor/highlight/styles/' + theme + '.css';
    }

    const getCodeNode = () => {
        return document.getElementById('code');
    };

    const getCodeBgNode = () => {
        return document.getElementById('codebg');
    };

    const getLanguageSelect = () => {
        return document.getElementById('language-select');
    };

    const getHljsCssLink = () => {
        return document.getElementById('hljs-theme');
    }

    const getThemeSelect = () => {
        return document.getElementById('theme-select');
    };

    const getSaveConfigButton = () => {
        return document.getElementById('save-config');
    };

    const getErrorTextNode = () => {
        return document.querySelector('#error-box p');
    };
    
    const getErrorNode = () => {
        return document.getElementById('error-box');
    };
    
    const setLanguage = (lang) => {
        const codeNode = getCodeNode();
        const highlighted = hljs.highlight(codeNode.textContent, { language: lang });
        codeNode.innerHTML = highlighted.value;
    };

    const setTheme = (theme) => {
        // set class on the html element
        const codeBg = getCodeBgNode();
        codeBg.classList.remove(...codeBg.classList);
        codeBg.classList.add(getBgThemeName(theme));

        // import the correct CSS file
        const link = getHljsCssLink();
        link.href = getCssThemeName(theme);
    };

    const setCode = (code) => {
        const codeNode = getCodeNode();
        codeNode.textContent = code;
    };

    const setTitle = (title) => {
        const titleNode = document.getElementById('title');
        titleNode.textContent = title;
    };

    const setError = (error) => {
        const errorTextNode = getErrorTextNode();
        const errorNode = getErrorNode();
        const codeNode = getCodeBgNode();
        errorTextNode.textContent = error;
        errorNode.style.visibility = 'visible';
        codeNode.parentElement.style.visibility = 'collapse';
    };

    const receiveCode = (data, sender) => {
        browser.runtime.onMessage.removeListener(receiveCode);
        if (data.code !== null) {
            setTitle(data.title);
            setCode(data.code);
        } else if (data.error !== null) {
            setError(data.error);    
        } else {
            console.error('Internal error');
        }
        return Promise.resolve();
    };

    const getConfigFromPage = () => {
        return {
            language: getLanguageSelect().value,
            theme: getThemeSelect().value,
        };
    }

    const saveConfigInStorage = (config) => {
        try {
            browser.storage.local.set(config);
        } catch (e) {
            console.error(e);
        }
    };

    const loadConfigFromStorage = async () => {
        try {
            const result = await browser.storage.local.get();
            return Object.keys(result).length > 0 ? result : null;
        } catch (_e) {
            return null;
        }
    }

    const loadConfig = async () => {
        let result = await loadConfigFromStorage();
        
        if (result === null) {
            result = {
                language: DEFAULT_LANGUAGE,
                theme: DEFAULT_THEME,
            };
            saveConfigInStorage(result);
        }
        getLanguageSelect().value = result.language;
        getThemeSelect().value = result.theme;
        setLanguage(result.language);
        setTheme(result.theme);
    };

    const setupPage = async () => {
        // prepare language selection list",
        const langSelect = getLanguageSelect();
        hljs.listLanguages().forEach(lang => {
            const option = document.createElement('option');
            option.textContent = lang;
            langSelect.appendChild(option);
        });

        langSelect.addEventListener('change', (event) => { setLanguage(event.target.value); });
        
        const themeSelect = getThemeSelect();
        THEMES.forEach(theme => {
            const option = document.createElement('option');
            option.textContent = theme;
            themeSelect.appendChild(option);
        });

        themeSelect.addEventListener('change', (event) => { setTheme(event.target.value); });

        const saveConfigButton = getSaveConfigButton();
        saveConfigButton.addEventListener('click', () => { saveConfigInStorage(getConfigFromPage()); });

        await loadConfig();
    };

    browser.runtime.onMessage.addListener(receiveCode);
    window.addEventListener('load', async () => {
        setupPage();
    });
})();