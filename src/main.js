const getMessageContent = (fullMessage) => {
    if (fullMessage.contentType === 'text/plain') {
        return {
            code: fullMessage.body,
            error: null
        };
    } else {
        if (!fullMessage.hasOwnProperty('parts') ||fullMessage.parts.length === 0) {
            console.error(fullMessage);
            return {
                code: null,
                error: 'Failed to decode the message'
            }
        }
        return getMessageContent(fullMessage.parts[0]);
    }
}

const openCodeTab = async (tab) => {
    const message = await messenger.messageDisplay.getDisplayedMessage(tab.id);
    const { code, error } = getMessageContent(await messenger.messages.getFull(message.id));
    browser.tabs.create({
        active: true,
        url: '/tab/index.html'
    }).then(async (tab) => {
        const id = tab.id;
        const handleUpdatedTab = async (tabIdUpdated, changeInfo, tabInfo) => {
            if (tabIdUpdated === id && changeInfo.status === 'complete') {
                await browser.tabs.sendMessage(id, {
                    title: message.subject,
                    code,
                    error
                });
                browser.tabs.onUpdated.removeListener(handleUpdatedTab);
            }
        }
        browser.tabs.onUpdated.addListener(handleUpdatedTab);
    }, (err) => {
        console.log(err);
    });
};

// Initialization
messenger.messageDisplayAction.onClicked.addListener(openCodeTab);