const getMessageContent = (fullMessage) => {
    if (fullMessage.parts[0].contentType === 'text/plain') {
        return fullMessage.parts[0].body;
    } else if (fullMessage.parts[0].contentType === 'multipart/signed') {
        return getMessageContent(fullMessage.parts[0]);
    }
}

const openCodeTab = async (tab) => {
    const message = await messenger.messageDisplay.getDisplayedMessage(tab.id);
    const body = getMessageContent(await messenger.messages.getFull(message.id));

    browser.tabs.create({
        active: true,
        url: '/tab/index.html'
    }).then(async (tab) => {
        const id = tab.id;
        const handleUpdatedTab = async (tabIdUpdated, changeInfo, tabInfo) => {
            if (tabIdUpdated === id && changeInfo.status === 'complete') {
                await browser.tabs.sendMessage(tab.id, { title: message.subject, code: body });
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