const sendNotification = (title, message) => {
	chrome.notifications.create({
		type: "basic",
		iconUrl: "../images/icon128.png",
		title: title,
		message: message,
	});
};

function extractInvoiceNumber(cellValue) {
	const match = cellValue.match(/Invoice:\s*(\d+)/);
	console.log("match", match);
	return match ? match[1] : null;
}