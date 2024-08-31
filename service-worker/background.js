// Imports
importScripts("../util/helper.js");

// Verify extension is installed
chrome.runtime.onInstalled.addListener(() => {
	console.log("Invoice Control Extension Installed");
});

// Add export button to Google Sheets
chrome.action.onClicked.addListener((tab) => {
	chrome.tabs.create({ url: "index.html" });
	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		files: ["content.js", "styles.css"],
	});
});

// Listen for messages from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === "notify") {
		sendNotification(request.title, request.message);
	}

	// Handle token data
	if (request.type === "getAuthToken") {
		chrome.identity.getAuthToken({ interactive: true }, function (token) {
			if (chrome.runtime.lastError) {
				sendResponse({ error: chrome.runtime.lastError });
			} else {
				sendResponse({ token: token });
			}
		});
		return true;
	}

	if (request.type === "saveToken") {
		chrome.storage.local.set({ token: request.token }, function () {
			// sendNotification('Dev', 'Token stored successfully')
		});
	}

	if (request.type === "getToken") {
		chrome.storage.local.get("token", function (result) {
			if (result.token) {
				sendResponse({ token: result.token });
			}
		});
		return true;
	}

	// Handle user data
	if (request.type === "saveUserInfo") {
		chrome.storage.local.set({ userInfo: request.userInfo }, function () {
			// sendNotification('Dev', 'Token stored successfully')
		});
	}

	// DEPRECATED - To be removed
	if (request.type === "getFolderID") {
		chrome.storage.local.get("driveFolderId", function (result) {
			if (result.driveFolderId) {
				sendResponse({ driveFolderId: result.driveFolderId });
			}
		});
		return true;
	}

	// Pass Popup.js data to content.js
	if (request.type === "requestPopupData") {
		chrome.runtime.sendMessage({ type: "getPopupData" }, function (response) {
			if (chrome.runtime.lastError) {
				sendResponse({ error: "Failed to retrieve popup data" });
			} else if (response && !response.data) {
				sendResponse({ error: "Failed to retrieve popup data" });
			} else {
				sendResponse(response);
			}
		});
		return true;
	}
});
