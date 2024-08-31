const sendNotification = (title, message) => {
	chrome.notifications.create({
		type: "basic",
		iconUrl: "../images/icon128.png",
		title: title,
		message: message,
	});
};