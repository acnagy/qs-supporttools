chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log(message);
    if (message.method === "chatBubbles") {
        $(".comment:visible:contains(Chat started on)").each(function() {
            var chatBody = $(this).children("p:last");
            var chatText = chatBody.text();
            
            var conversationWrapper = $("<div/>", {"id": "conversation"});
            conversationWrapper.insertBefore(chatBody);
            
            messages = parseChat(chatText);
            makeBubbles(messages, conversationWrapper);
        });
    }
});

function parseChat(chatText) {
    return chatText.split("\n");
}

function makeBubbles(messages, conversationWrapper) {
    var displayedCount = 0;
    messages.forEach(function(message) {
        var re = /\((.+)\) (.+): (.+)\s*/g;
        var match = re.exec(message);
        if (match) {
            var timestamp = match[1];
            var sender = match[2];
            var messageText = match[3];
            if (!sender.match("SYSTEM")) {
                var showTimestamp = displayedCount % 5 === 0;
                displayedCount ++;
                firstMessage = false;
                appendMessage(timestamp, sender, messageText, showTimestamp, conversationWrapper);
            }
        }
    });
}


function appendMessage(timestamp, sender, messageText, showTimestamp, conversation) {
    if (showTimestamp) {
        $("<p/>", {"class": "datestamp"})
            .text(timestamp)
            .appendTo(conversation);
    }

    var bubbleClass = isQSAgent(sender) ? "bubble bubble-alt yellow" : "bubble";
    var newBubble = $("<div/>", {
        "class": bubbleClass, 
        "title": timestamp
    });
    newBubble.text(messageText)
        .addClass(bubbleClass);
    var senderSpan = $("<span/>", {"class": "sender"}).text(sender + ": ");
    newBubble.prepend(senderSpan);

    var newContainer = $("<div/>", {"class": "container"});
    newContainer.append(newBubble);
    conversation.append(newContainer);
}

function isQSAgent(sender) {
    var qsAgents = ["Anna", "Azroy", "Elisabeth", "Rick", "Victor", "Azreen", "Ben", "Bernadette", "Elka", "Emily", "Ezekiel", "Marsha", "Regie"];
    for (var i = 0; i < qsAgents.length; i++) {
        if (sender.match(qsAgents[i])) {
            return true;
        }
    }
    return false;
}
